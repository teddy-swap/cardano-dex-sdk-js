import { HexString, TxHash } from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
  ammPool: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1wqx8pkqywyu3qd2x7rnk4tlvlhcxvl9m897gjah5pt50evc2v3m47",
  ammRedeem: "addr_test1wz4ktrt9k4chhurm6wc6ntfg6vwpswq3hwjqw6h2e607hrswlvszv",
  ammSwap: "addr_test1wp9tz7hungv6furtdl3zn72sree86wtghlcr4jc637r2eagcksy0g",
  ammPool: "addr_test1wq5th50h46anh3v7zdvh7ve6amac7k4h3mdfvt0p6czm8zq7k79xv"
}

export const OrderAddrsV1Mainnet: OrderAddrs = {
  ammDeposit: "addr_test1wqx8pkqywyu3qd2x7rnk4tlvlhcxvl9m897gjah5pt50evc2v3m47",
  ammRedeem: "addr_test1wz4ktrt9k4chhurm6wc6ntfg6vwpswq3hwjqw6h2e607hrswlvszv",
  ammSwap: "addr_test1wp9tz7hungv6furtdl3zn72sree86wtghlcr4jc637r2eagcksy0g",
  ammPool: "addr_test1wq5th50h46anh3v7zdvh7ve6amac7k4h3mdfvt0p6czm8zq7k79xv"
}

export type ScriptCreds = {
  ammPool: HexString
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const ScriptCredsV1: ScriptCreds = {
  ammPool: "28bbd1f7aebb3bc59e13597f333aeefb8f5ab78eda962de1d605b388",
  ammDeposit: "0c70d8047139103546f0e76aafecfdf0667cbb397c8976f40ae8fcb3",
  ammRedeem: "ab658d65b5717bf07bd3b1a9ad28d31c183811bba4076aeace9feb8e",
  ammSwap: "4ab17afc9a19a4f06b6fe229f9501e727d3968bff03acb1a8f86acf5"
}

export type OpInRef = {
  readonly opInRefHash: TxHash;
  readonly opInRefIndex: number;
}

export type OpInRefs = {
  ammSwap: OpInRef;
  ammDeposit: OpInRef;
  ammRedeem: OpInRef;
}

export type DatumRewardPKHIndex = {
  ammSwap: number;
  ammDeposit: number;
  ammRedeem: number;
}

export const OpInRefsPreviewV1: OpInRefs = {
  ammSwap: {
    opInRefHash: '81bdfd89f3c8ff1a23dbe70af2db399ad0ed028b36a41974662a2cf8cda3c7c3',
    opInRefIndex: 0
  },
  ammDeposit: {
    opInRefHash: '77186dc10826227acd5e4a48e636bd3b11d5f39cc051d794540a7125903e157c',
    opInRefIndex: 0
  },
  ammRedeem: {
    opInRefHash: '2266866d4d85cd582a34d27638a6eeb885cc4fb96fee230c86720e1f3f9eb0a0',
    opInRefIndex: 0
  }
}

export const datumRewardPKHIndex: DatumRewardPKHIndex = {
  ammSwap: 6,
  ammDeposit: 5,
  ammRedeem: 5
}

export const OpInRefsMainnetV1: OpInRefs = {
  ammSwap: {
    opInRefHash: '81bdfd89f3c8ff1a23dbe70af2db399ad0ed028b36a41974662a2cf8cda3c7c3',
    opInRefIndex: 0
  },
  ammDeposit: {
    opInRefHash: '77186dc10826227acd5e4a48e636bd3b11d5f39cc051d794540a7125903e157c',
    opInRefIndex: 0
  },
  ammRedeem: {
    opInRefHash: '2266866d4d85cd582a34d27638a6eeb885cc4fb96fee230c86720e1f3f9eb0a0',
    opInRefIndex: 0
  }
}
