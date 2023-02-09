import {HexString} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1wr8h2meedj6ww948lq92x39gp99d2jh2ve40zgnp36782tqm2usdc",
  ammRedeem: "addr_test1wz3wqe54kf4fvuw77jtg2z7jftqum74glkfsxmv5rwvredc4qvcvr",
  ammSwap: "addr_test1wr623ag5vs3sz0gxlwnskemuqujssxvpstk7ayt48729ltsa47uze"
}

export type ScriptCreds = {
  ammPool: HexString
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const ScriptCredsV1: ScriptCreds = {
  ammPool: "36170eeadfc1d7d72ada62c19dc51c9656f1ed0cc93c1da2c1e900a2",
  ammDeposit: "cf756f396cb4e716a7f80aa344a8094ad54aea666af122618ebc752c",
  ammRedeem: "a2e06695b26a9671def496850bd24ac1cdfaa8fd93036d941b983cb7",
  ammSwap: "f4a8f5146423013d06fba70b677c072508198182edee91753f945fae"
}

