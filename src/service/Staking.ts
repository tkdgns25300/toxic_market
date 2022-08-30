import Caver, { KIP17 } from "caver-js";
import axios from "axios";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { StakingSearchReq } from "../api/request/StakingSearchReq";
import { StakingQueryRepo } from "../repository/Staking";
import { StakingContractTokenDto } from "../dto/Staking";
import { ABI, TOX_CONTRACT_ADDRESS } from "../middlewares/smartContract";

const caver = new Caver("https://public-node-api.klaytnapi.com/v1/cypress");
// const caver = new Caver('https://api.baobab.klaytn.net:8651/')

const keyring = caver.wallet.keyring.createFromPrivateKey(
  process.env.WALLET_PRIVATE_KEY
);
const myKeyring = caver.wallet.keyring.createFromPrivateKey(
  '0x7f11dfc8388bbb3d55445bf469a954542f47ec7c806ae9535fe9f793afe99713'
)
caver.wallet.add(myKeyring);
caver.wallet.add(keyring);

@Service()
export class StakingService {
  constructor(
    @InjectRepository()
    readonly stakingQueryRepo: StakingQueryRepo
  ) {}

  async findUserNFT(param: StakingSearchReq, public_address: string) {
    // 유저의 모든 NFT
    const userAllNFT = await axios({
      method: "get",
      url: `https://th-api.klaytnapi.com/v2/account/${[public_address]}/token?kind=nft`,
      headers: {
        "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
          ? process.env.KLAYTN_API_X_CHAIN_ID
          : "8217",
        Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
      },
    });

    // 유저의 NFT중 톡시에이프 NFT만 필터링(Toxic-Ape, Foolkat, Succubus, Toxic-Ape-Special)
    // const toxicNFTContractAddress = [process.env.TOXIC_APE, process.env.FOOLKATS, process.env.SUCCUBUS, process.env.TOXIC_APE_SPECIAL]
    /**
     * Todo : Remove this to deploy
     */
    const toxicNFTContractAddress = [process.env.TOXIC_APE, process.env.FOOLKATS, process.env.SUCCUBUS, process.env.TOXIC_APE_SPECIAL, '0x9faccd9f9661dddec3971c1ee146516127c34fc1']
    let userToxicNFT = userAllNFT.data.items.filter(NFT => toxicNFTContractAddress.includes(NFT.contractAddress))

    // contract_address 필터링
    if (param.contract_address) {
      userToxicNFT = userToxicNFT.filter(NFT => NFT.contractAddress === param.contract_address)
    }

    // Pagination
    userToxicNFT = userToxicNFT.slice(param.getOffset(), param.getOffset() + param.getLimit())
    
    return userToxicNFT;
  }

  async stakingNFT(param: StakingContractTokenDto, public_address: string) {
    // const result = await axios({
    //   method: "get",
    //   url: `https://wallet-api.klaytnapi.com/v2/account/0xF52973CB17BD06d874f2f0283febb669B7775aB0`,
    //   headers: {
    //     "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
    //       ? process.env.KLAYTN_API_X_CHAIN_ID
    //       : "8217",
    //     Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
    //   },
    // }).then(console.log)
    // return result

    // @ts-ignore
    const contractInstance = caver.contract.create(ABI, TOX_CONTRACT_ADDRESS);
    // const kip17 = new caver.kct.kip17('0xe50c9ba45bc554d76ecc2fc102ec20eb8d738885')
    // const kip17 = new caver.kct.kip17('0x9faccd9f9661dddec3971c1ee146516127c34fc1')
    // await kip17.transferFrom('0x216D59b59729d902E066efe266FC2dB212FF5d2E', '0xf9496b7E5989647AD47bcDbe3bd79E98FB836514', '0xa352d999', {
    //   from: '0x216D59b59729d902E066efe266FC2dB212FF5d2E',
    //   feeDelegation: true,
    //   feePayer: '0x216D59b59729d902E066efe266FC2dB212FF5d2E'
    // }).then(console.log)
    // console.log(await kip17.ownerOf(0xa352d999))
    await contractInstance.send(
      { from: keyring.address, gas: "0x4bfd200" },
      "safeTransfer",
      '0x216D59b59729d902E066efe266FC2dB212FF5d2E',
      '0xf9496b7E5989647AD47bcDbe3bd79E98FB836514',
      `0x1ee4bc21`
    );
    return keyring.address
  }
}