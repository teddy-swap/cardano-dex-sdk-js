import { Addr } from "../../../cardano/entities/address"
import { TxCandidate } from "../../../cardano/entities/tx"
import { FullTxIn } from "../../../cardano/entities/txIn"
import { TxOutCandidate } from "../../../cardano/entities/txOut"
import { Value } from "../../../cardano/entities/value"
import { TxContext } from "../../../cardano/wallet/entities/txContext"
import { InputSelector } from "../../../cardano/wallet/inputSelector"
import { TxMath } from "../../../cardano/wallet/txMath"
import { selectInputs } from "./selectInputs"

export interface SendLovelaceParams {
  readonly lovelace: bigint,
  readonly targetAddress: string,
  readonly changeAddress: string,
}

export class SendLovelaceTxBuilder {
  constructor(
    private txMath: TxMath,
    private inputSelector: InputSelector
  ) { }

  async build(params: SendLovelaceParams, allInputs: FullTxIn[]): Promise<[TxCandidate]> {
    const { lovelace, changeAddress } = params;
    const inputsOrError = await selectInputs(Value(lovelace), changeAddress, this.inputSelector, allInputs, this.txMath);
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

  txCandidate = (req: SendLovelaceParams, ctx: TxContext): TxCandidate => {
    return {
      inputs: ctx.inputs,
      outputs: this.txOutCandidate(Value(req.lovelace), req.targetAddress),
      changeAddr: ctx.changeAddr
    }
  }
}