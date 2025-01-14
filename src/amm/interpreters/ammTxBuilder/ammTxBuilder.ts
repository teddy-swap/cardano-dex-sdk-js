import { Transaction } from "@emurgo/cardano-serialization-lib-nodejs"
import { TxCandidate } from "../../../cardano/entities/tx"
import { FullTxIn } from "../../../cardano/entities/txIn"
import { CollateralSelector } from "../../../cardano/wallet/collateralSelector"
import { InputCollector, InputSelector } from "../../../cardano/wallet/inputSelector"
import { TxAsm } from "../../../cardano/wallet/txAsm"
import { TxMath } from "../../../cardano/wallet/txMath"
import { CardanoWasm } from "../../../utils/rustLoader"
import { AmmActions } from "../ammActions"
import { AmmOutputs } from "../ammOutputs"
import { DepositAmmTxBuilder, DepositParams, DepositTxInfo } from "./depositAmmTxBuilder"
import { PoolCreationParams, PoolCreationTxBuilder, PoolCreationTxInfo } from "./poolCreationTxBuilder";
import { RedeemAmmTxBuilder, RedeemParams, RedeemTxInfo } from "./redeemAmmTxBuilder"
import { SendAssetParams, SendAssetTxBuilder } from "./sendAssetTxBuilder"
import { SendLovelaceParams, SendLovelaceTxBuilder } from "./sendLovelaceTxBuilder"
import { SwapAmmTxBuilder, SwapParams, SwapTxInfo } from "./swapAmmTxBuilder"

export interface AmmTxBuilder {
  swap(params: SwapParams): Promise<[Transaction | null, TxCandidate, SwapTxInfo, Error | null]>;

  redeem(params: RedeemParams): Promise<[Transaction | null, TxCandidate, RedeemTxInfo, Error | null]>;

  deposit(params: DepositParams): Promise<[Transaction | null, TxCandidate, DepositTxInfo, Error | null]>;

  poolCreation(params: PoolCreationParams): Promise<[Transaction | null, TxCandidate, PoolCreationTxInfo, Error | null]>;

  sendAdaToAddress(params: SendLovelaceParams): Promise<[Transaction | null, TxCandidate, Error | null]>;
}

const MAX_TRANSACTION_BUILDING_TRY_COUNT = 3

export class DefaultAmmTxCandidateBuilder implements AmmTxBuilder {
  private swapAmmTxBuilder: SwapAmmTxBuilder

  private redeemAmmTxBuilder: RedeemAmmTxBuilder

  private depositAmmTxBuilder: DepositAmmTxBuilder

  private poolTxBuilder: PoolCreationTxBuilder

  private sendLovelaceTxBuilder: SendLovelaceTxBuilder

  private sendAssetTxBuilder: SendAssetTxBuilder

  constructor(
    txMath: TxMath,
    ammOuptuts: AmmOutputs,
    ammActions: AmmActions,
    inputSelector: InputSelector,
    private inputCollector: InputCollector,
    collateralSelector: CollateralSelector,
    R: CardanoWasm,
    private txAsm: TxAsm
  ) {
    this.swapAmmTxBuilder = new SwapAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
    this.redeemAmmTxBuilder = new RedeemAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
    this.depositAmmTxBuilder = new DepositAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
    this.poolTxBuilder = new PoolCreationTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, collateralSelector)
    this.sendLovelaceTxBuilder = new SendLovelaceTxBuilder(txMath, inputSelector)
    this.sendAssetTxBuilder = new SendAssetTxBuilder(txMath, inputSelector)
  }

  async swap(
    swapParams: SwapParams,
    currentTry = 1,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, SwapTxInfo, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [swapTxCandidate, swapTxInfo] = await this
        .swapAmmTxBuilder
        .build(swapParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, swapTxCandidate, swapTxInfo, null]
    }
    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [swapTxCandidate, swapTxInfo] = await this.swapAmmTxBuilder.build(swapParams, newAllInputs, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(swapTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, swapTxCandidate, swapTxInfo, null]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.swap(swapParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, swapTxCandidate, { ...swapTxInfo, txFee: undefined }, e as Error]
    }
  }

  async redeem(
    redeemParams: RedeemParams,
    currentTry = 1,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, RedeemTxInfo, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [redeemTxCandidate, redeemTxInfo] = await this
        .redeemAmmTxBuilder
        .build(redeemParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, redeemTxCandidate, redeemTxInfo, null]
    }

    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [redeemTxCandidate, redeemTxInfo] = await this.redeemAmmTxBuilder.build(redeemParams, newAllInputs, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(redeemTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, redeemTxCandidate, redeemTxInfo, null]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.redeem(redeemParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, redeemTxCandidate, { ...redeemTxInfo, txFee: undefined }, e as Error]
    }
  }

  async deposit(
    depositParams: DepositParams,
    currentTry = 0,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, DepositTxInfo, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [depositTxCandidate, depositTxInfo] = await this
        .depositAmmTxBuilder
        .build(depositParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, depositTxCandidate, depositTxInfo, null]
    }

    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [depositTxCandidate, depositTxInfo] = await this.depositAmmTxBuilder.build(depositParams, newAllInputs, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(depositTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, depositTxCandidate, depositTxInfo, null]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.deposit(depositParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, depositTxCandidate, { ...depositTxInfo, txFee: undefined }, e as Error]
    }
  }

  async poolCreation(
    poolParams: PoolCreationParams,
    currentTry = 0,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, PoolCreationTxInfo, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [setupTxCandidate, setupTxInfo] = await this
        .poolTxBuilder
        .build(poolParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, setupTxCandidate, setupTxInfo, null]
    }

    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [poolCreationTxCandidate, poolCreationTxInfo] = await this.poolTxBuilder.build(poolParams, newAllInputs, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(poolCreationTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [
          this.txAsm.finalize(poolCreationTxCandidate, 1.05),
          poolCreationTxCandidate,
          poolCreationTxInfo,
          null
        ]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.poolCreation(poolParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, poolCreationTxCandidate, { ...poolCreationTxInfo, txFee: undefined }, e as Error]
    }
  }

  async sendAdaToAddress(param: SendLovelaceParams, allInputs?: FullTxIn[]): Promise<[Transaction | null, TxCandidate, Error | null]> {
    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [sendLovelaceTxCandidate] = await this.sendLovelaceTxBuilder.build(param, newAllInputs);
    try {
      const finalTx = this.txAsm.finalize(sendLovelaceTxCandidate);
      return [finalTx, sendLovelaceTxCandidate, null];
    } catch (e) {
      console.log(e)
      return [null, sendLovelaceTxCandidate, e as Error]
    }
  }

  async sendAssetToAddress(param: SendAssetParams, allInputs?: FullTxIn[]): Promise<[Transaction | null, TxCandidate, Error | null]> {
    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [sendAssetTxCandidate] = await this.sendAssetTxBuilder.build(param, newAllInputs);
    try {
      const finalTx = this.txAsm.finalize(sendAssetTxCandidate);
      return [finalTx, sendAssetTxCandidate, null];
    } catch (e) {
      console.log(e)
      return [null, sendAssetTxCandidate, e as Error]
    }
  }
}
