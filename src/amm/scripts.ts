import { HexString, TxHash } from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
  ammPool: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1zqx8pkqywyu3qd2x7rnk4tlvlhcxvl9m897gjah5pt50evumcwxf9p2t3jk4cnp97nkt2vg30nvfku5umf686kqx054q546z3w",
  ammRedeem: "addr_test1zz4ktrt9k4chhurm6wc6ntfg6vwpswq3hwjqw6h2e607hr5mcwxf9p2t3jk4cnp97nkt2vg30nvfku5umf686kqx054q643cyh",
  ammSwap: "addr_test1zp9tz7hungv6furtdl3zn72sree86wtghlcr4jc637r2eavmcwxf9p2t3jk4cnp97nkt2vg30nvfku5umf686kqx054qpf03fa",
  ammPool: "addr_test1zq5th50h46anh3v7zdvh7ve6amac7k4h3mdfvt0p6czm8zymcwxf9p2t3jk4cnp97nkt2vg30nvfku5umf686kqx054qgl8mja"
}

export const OrderAddrsV1Mainnet: OrderAddrs = {
  ammDeposit: "addr1zyx8pkqywyu3qd2x7rnk4tlvlhcxvl9m897gjah5pt50evakp2avt5gp297dnxhxcmy6kkptepsr5pa409qa7gf8stzs6z6f9z",
  ammRedeem: "addr1zx4ktrt9k4chhurm6wc6ntfg6vwpswq3hwjqw6h2e607hr4kp2avt5gp297dnxhxcmy6kkptepsr5pa409qa7gf8stzs5z3nsm",
  ammSwap: "addr1z99tz7hungv6furtdl3zn72sree86wtghlcr4jc637r2eadkp2avt5gp297dnxhxcmy6kkptepsr5pa409qa7gf8stzs0706a3",
  ammPool: "addr1zy5th50h46anh3v7zdvh7ve6amac7k4h3mdfvt0p6czm8z9kp2avt5gp297dnxhxcmy6kkptepsr5pa409qa7gf8stzsxg8sx3"
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
    opInRefHash: 'fb6906c2bc39777086036f9c46c297e9d8a41ede154b398d85245a2549b4bf04',
    opInRefIndex: 0
  },
  ammDeposit: {
    opInRefHash: '570f810fe5f8cef730587fb832bb70d8783bad711064d70fc1a378cbefdd7c94',
    opInRefIndex: 0
  },
  ammRedeem: {
    opInRefHash: 'e33584ade2b47fb0ab697b63585fb4be935852131643981ba95acde09fe31f41',
    opInRefIndex: 0
  }
}
