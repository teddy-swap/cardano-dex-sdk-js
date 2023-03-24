import {TxCandidate} from "../../cardano/entities/tx"
import {FullTxIn} from "../../cardano/entities/txIn"
import {TxOutCandidate} from "../../cardano/entities/txOut"
import {emptyValue} from "../../cardano/entities/value"
import {CardanoNetwork} from "../../quickblue/cardanoNetwork"
import {RefundParams} from "../models/refundParams"
import {OrderAddrsV1Testnet, ScriptCredsV1} from "../scripts"
import {AdaAssetName, AdaPolicyId} from "../../cardano/constants"

export interface Refunds {
  /** Redeem assets from a proxy order box.
   */
  refund(params: RefundParams): Promise<TxCandidate>
}

const AddressesToRefund = [
  OrderAddrsV1Testnet.ammDeposit,
  OrderAddrsV1Testnet.ammSwap,
  OrderAddrsV1Testnet.ammRedeem
]

const mapRefundAddressToScript = {
  [OrderAddrsV1Testnet.ammDeposit]: ScriptCredsV1.ammDeposit,
  [OrderAddrsV1Testnet.ammSwap]:    "5904f901000032323232323232323232323232323232323232323222253330143232323232323232323232323232323232323232323232323232323253330303370e90010010991919299981999b8753330333370e6eb4c0d0c0d403d2000148000520024800054cc090cdc399814805181a00e240042a66048664466ebcdd3981c0011ba730380013034004303400815330243370e666064444a666060002200426600666e00009200230380014800004d20041533024337126eb4c0d0c0d405800854cc0900044cccc8888cdc499b833370466e08cc0b403800c008004cdc019b823302d00e004483403ccdc100100099b8000648008c0d0078c0d0074dd6981a00b1bad303401b13322332303522533303200114a02a66607066ebcc0e400400c52889801181d0009ba90010023758606864606c606c606c606c606c002606a0286eb8c0d00614cc8cc0cc00452899191929981319b8f375c606c606e0046eb8c0d8c0dc0044cdc79bae3036002375c606c002606e04e606c002606603826666644444646466e24cdc099b81302900d375a00266e0ccdc10028020019814809a99981c191929981599b8f375c607660780046eb8c0ecc0f00044cdc79bae303b002375c60760026078058607600c26ea00144004dd424000606603a6eb4c0cc054004dd6981980c9bad303301853330313232325330253371e6eb8c0d4c0d8008dd7181a981b000899b8f375c606a0046eb8c0d4004c0d8098c0d4004c0c806c4cdc199b82001375a606402e66e04dd6981900b9bad30320181001337026604c01460620346604c00860620342c606600460540026ea8c0b8c0bc064dd599181718179818000981698170009817000998139bad302b00700a37566460566058605a002605460560026056002660486eb4c0a001401ccc88c8c8c94ccc0acc8c8c94ccc0b8cdc3a40040042646464a66606266e1d200000214a0266ebcdd38021ba70013034002302b001375400e2646464a66606266e1d200200214a0266ebcdd38021ba70013034002302b001375400e606200460500026ea8004400858c8c8c8c8c94ccc0bccdc3a4000004264646464a66606666e1d200000213232323253330373370e90010010b099ba548000004c0e8008c0c4004dd5000981a0008b181b00118168009baa001303000113374a9001015181900118148009baa001302c302d302e001302b302d0053756646464a66605866e1d2002002161533302c3371e6eb8c0b40040184c0b4c0b8c0bc01c58c0bc008c098004dd50009918151816000981498158019bae302700b302700a33022375a604c002008604c002604a002604a0206eb0c088008dd61810801181098108009810980f805180f800980f000980e800980e000980d800980d000980c800980c000980c002180b8008a4c2c4a66601600229000099980899baf300d3012001375200c6eb4c054c048dd5980a9809000a4000446660220040020062940cdd2a4000660026ea4008cc004dd48010042ba0489002232333004003375c601c0026eb8c038c03c004c03c004888cccc01000920002333300500248001d69bab00100323002375200244446601444a66600e002200a2a66601a66ebcc024c0380040184c010c044c0380044c008c03c00400555cfa5eb8155ce91299980299b8800248000584cc00c008004c0048894ccc014cdc3801240002600c00226600666e04009200230070012323002233002002001230022330020020015734ae855d1118011baa0015573c1",
  [OrderAddrsV1Testnet.ammRedeem]:  ScriptCredsV1.ammRedeem
}

export class AmmOrderRefunds implements Refunds {
  constructor(public readonly network: CardanoNetwork) {
  }

  async refund(params: RefundParams): Promise<TxCandidate> {
    const tx = await this.network.getTx(params.txId)
    const outputToRefund = tx?.outputs.find(o => AddressesToRefund.includes(o.addr))

    if (outputToRefund) {
      const inputs: FullTxIn = {
        txOut:         outputToRefund,
        consumeScript: {
          validator: mapRefundAddressToScript[outputToRefund.addr],
          redeemer:  "d8799f00000001ff",
          datum:     outputToRefund.dataBin
        }
      }

      const refundOut: TxOutCandidate = {
        addr:  params.recipientAddress,
        value: outputToRefund.value.map(item => item.policyId === AdaPolicyId && item.name === AdaAssetName ?
          ({ ...item, quantity: item.quantity  }) : item
        )
      }

      return Promise.resolve({
        inputs:     [inputs, ...params.inputs],
        dataInputs: [],
        outputs:    [refundOut],
        valueMint:  emptyValue,
        changeAddr: params.recipientAddress,
        collateral: params.collateral,
      })
    } else {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }
  }
}
