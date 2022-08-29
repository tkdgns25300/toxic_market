import Caver from "caver-js";
import axios from "axios";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { StakingSearchReq } from "../api/request/StakingSearchReq";
import { StakingQueryRepo } from "../repository/Staking";

// const caver = new Caver("https://public-node-api.klaytnapi.com/v1/cypress");
// // const caver = new Caver('https://api.baobab.klaytn.net:8651/')

// const keyring = caver.wallet.keyring.createFromPrivateKey(
//   process.env.WALLET_PRIVATE_KEY
// );
// caver.wallet.add(keyring);

@Service()
export class StakingService {
  constructor(
    @InjectRepository()
    readonly stakingQueryRepo: StakingQueryRepo
  ) {}

  // 타입 지정
  async findUserNFT(param: StakingSearchReq, public_address: string) {
    // 유저의 모든 NFT
    const userAllNFT = await axios({
      method: "get",
      url: `https://th-api.klaytnapi.com/v2/account/${public_address}/token?kind=nft`,
      headers: {
        "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
          ? process.env.KLAYTN_API_X_CHAIN_ID
          : "8217",
        Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
      },
    });

    // 유저의 NFT중 톡시에이프 NFT만 필터링(Toxic-Ape, Foolkat, Succubus, Toxic-Ape-Special)
    const toxicNFTContractAddress = [process.env.TOXIC_APE, process.env.FOOLKATS, process.env.SUCCUBUS, process.env.TOXIC_APE_SPECIAL]
    let userToxicNFT = userAllNFT.data.items.filter(NFT => toxicNFTContractAddress.includes(NFT.contractAddress))

    // contract_address 필터링
    if (param.contract_address) {
      userToxicNFT = userToxicNFT.filter(NFT => NFT.contractAddress === param.contract_address)
    }

    // Pagination
    userToxicNFT = userToxicNFT.slice(param.getOffset(), param.getOffset() + param.getLimit())
    
    return userToxicNFT
  }
}