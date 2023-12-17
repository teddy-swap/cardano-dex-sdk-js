import { Addr } from "../../../cardano/entities/address"
import { TxCandidate } from "../../../cardano/entities/tx"
import { FullTxIn } from "../../../cardano/entities/txIn"
import { TxOutCandidate } from "../../../cardano/entities/txOut"
import { add, Value } from "../../../cardano/entities/value"
import { TxContext } from "../../../cardano/wallet/entities/txContext"
import { InputSelector } from "../../../cardano/wallet/inputSelector"
import { TxMath } from "../../../cardano/wallet/txMath"
import { AssetAmount } from "../../../domain/assetAmount"
import { selectInputs } from "./selectInputs"

export interface SendAssetParams {
  readonly lovelace: bigint,
  readonly assets: AssetAmount[],
  readonly targetAddress: string,
  readonly changeAddress: string,
}

export class SendAssetTxBuilder {
  constructor(
    private txMath: TxMath,
    private inputSelector: InputSelector
  ) { }

  async build(params: SendAssetParams, allInputs: FullTxIn[]): Promise<[TxCandidate]> {
    const { lovelace, changeAddress, assets } = params;
    const targetOutput = assets.reduce((acc, asset) => add(acc, asset.toEntry), Value(lovelace));
    const inputsOrError = await selectInputs(targetOutput, changeAddress, this.inputSelector, allInputs, this.txMath);
    const inputs: FullTxIn[] = inputsOrError instanceof Error ? [] : inputsOrError;

    return [
      this.txCandidate(
        params,
        { inputs, changeAddr: changeAddress, ttl: 0, collateralInputs: [] }
      )];
  }

  txOutCandidate = (value: Value, targetAddress: Addr): [TxOutCandidate] => {
    return [{
      value,
      addr: targetAddress
    }]
  }

  txCandidate = (req: SendAssetParams, ctx: TxContext): TxCandidate => {
    const inputValue = req.assets.reduce((acc, asset) => add(acc, asset.toEntry), Value(req.lovelace));
    return {
      inputs: ctx.inputs,
      outputs: this.txOutCandidate(inputValue, req.targetAddress),
      changeAddr: ctx.changeAddr
    }
  }
}