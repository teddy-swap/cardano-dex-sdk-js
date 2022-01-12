import axios, {AxiosInstance} from "axios"
import {AssetInfo} from "../cardano/entities/AssetInfo"
import {Tx} from "../cardano/entities/tx"
import {FullTxOut} from "../cardano/entities/txOut"
import {AssetRef, OutputRef, PaymentCred, TxHash} from "../cardano/types"
import {JSONBI} from "../utils/json"
import {Items, QuickblueTx, QuickblueTxOut, toCardanoTx, toCardanoTxOut} from "./models"
import {Ordering, Paging} from "./types"

export interface CardanoNetwork {
  /** Get transaction by hash.
   */
  getTx(hash: TxHash): Promise<Tx | undefined>

  /** Get output by output reference.
   */
  getOutput(ref: OutputRef): Promise<FullTxOut | undefined>

  /** Get unspent outputs by payment credential.
   */
  getUtxosByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[FullTxOut[], number]>

  /** Get transactions related to a given payment credential.
   */
  getTxsByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[Tx[], number]>

  /**  Get unspent outputs by asset reference.
   */
  getUtxosByAsset(ref: AssetRef, paging: Paging, ordering?: Ordering): Promise<[FullTxOut[], number]>

  /**  Get asset info by asset reference.
   */
  getAssetInfo(ref: AssetRef): Promise<AssetInfo | undefined>
}

function fix<A, B>(a: A, fixF: (a: A) => B): A {
  fixF(a)
  return a
}

export class Quickblue implements CardanoNetwork {
  readonly backend: AxiosInstance

  constructor(uri: string) {
    this.backend = axios.create({
      baseURL: uri,
      timeout: 5000,
      headers: {"Content-Type": "application/json"}
    })
  }

  getAssetInfo(ref: AssetRef): Promise<AssetInfo | undefined> {
    return this.backend
      .request<AssetInfo>({
        url: `/assets/info/${ref}`,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => fix(res.data, ai => ai.quantity = BigInt(ai.quantity)))
  }

  getOutput(ref: OutputRef): Promise<FullTxOut | undefined> {
    return this.backend
      .request<QuickblueTxOut>({
        url: `/outputs/${ref}`,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => toCardanoTxOut(res.data))
  }

  getTx(hash: TxHash): Promise<Tx | undefined> {
    return this.backend
      .request<QuickblueTx>({
        url: `/transactions/${hash}`,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => toCardanoTx(res.data))
  }

  getTxsByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[Tx[], number]> {
    return this.backend
      .request<Items<QuickblueTx>>({
        url: `/transactions/implme/${pcred}`,
        params: paging,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [res.data.items.map(i => toCardanoTx(i)), res.data.total])
  }

  getUtxosByAsset(ref: AssetRef, paging: Paging, ordering?: Ordering): Promise<[FullTxOut[], number]> {
    return this.backend
      .request<Items<QuickblueTxOut>>({
        url: `/outputs/unspent/byAsset/${ref}`,
        params: {...paging, ordering},
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [res.data.items.map(i => toCardanoTxOut(i)), res.data.total])
  }

  getUtxosByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[FullTxOut[], number]> {
    return this.backend
      .request<Items<QuickblueTxOut>>({
        url: `/outputs/unspent/byPaymentCred/${pcred}`,
        params: paging,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [res.data.items.map(i => toCardanoTxOut(i)), res.data.total])
  }
}