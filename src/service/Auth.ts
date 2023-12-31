import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import axios from "axios";
const Caver = require("caver-js");

import { UserQueryRepo } from "../repository/User";
import { User } from "../entity";
import { PageResObj } from "../api";
import { generateAccessToken } from "../middlewares/Auth";
import { UserIdPasswordDto, UserSignUpDto } from "../dto/User";
import { hash } from "../util/hash";
import { StakingQueryRepo } from "../repository/Staking";

const caver = new Caver("https://public-node-api.klaytnapi.com/v1/cypress");

@Service()
export class AuthService {
  constructor(
    @InjectRepository()
    readonly userQueryRepo: UserQueryRepo,
    readonly stakingQueryRepo: StakingQueryRepo
  ) {}

  async findOne(public_address: string): Promise<PageResObj<User | {}>> {
    const result: User = await this.userQueryRepo.findOne(
      "public_address",
      public_address
    );
    if (!result) {
      return new PageResObj({}, "사용자를 찾는데 실패했습니다.", true);  
    }
    delete result.password_hash;
    return new PageResObj(result, "사용자를 찾는데 성공했습니다.");
  }
  /**
   * if address exists in DB, creates same message as the one that was signed by user
   * subtracts signature from signed message
   * checks if public Address in DB is the same with public address that has signed the message
   * if True, then it creates JWT token with public address and updates nonce value
   * */
  async walletLogin(data: { public_address: string; signature: string }) {
    const user: User = await this.userQueryRepo.findOne(
      "public_address",
      data.public_address.toLowerCase()
    );
    if (!user) {
      return new PageResObj({}, "not found", true);
    }

    const msg = `SIGN IN TO TOXIC MARKET PLACE #${user.nonce}`;

    const v = "0x" + data.signature.substring(2).substring(128, 130);
    const r = "0x" + data.signature.substring(2).substring(0, 64);
    const s = "0x" + data.signature.substring(2).substring(64, 128);
    const signature = [v, r, s];
    const isCorrectCredentials = await caver.validator.validateSignedMessage(
      msg,
      signature,
      user.public_address.toLowerCase()
    );

    if (!isCorrectCredentials) {
      return new PageResObj({}, "잘못된 서명입니다. 다시 시도하십시오", true);
    }
    const token = generateAccessToken(user);
    //update nonce value for safety
    user.nonce = String(Math.floor(Math.random() * 1000000));
    await this.userQueryRepo.update(
      user,
      "public_address",
      user.public_address
    );
    return new PageResObj({ token }, "로그인 성공했습니다.", false);
  }

  async generalLogin(paramObj: UserIdPasswordDto): Promise<PageResObj<User | {}>> {
    const user = await this.userQueryRepo.findOne("id", paramObj.id);
    if (!user) {
      return new PageResObj({}, "존재하지 않는 사용자입니다.", true);
    }
    if (user.password_hash !== hash(paramObj.password)) {
      return new PageResObj({}, "비밀번호가 일치하지 않습니다.", true);
    }
    const token = generateAccessToken(user)
    return new PageResObj({ token }, "로그인 성공하였습니다.", false);
  }

  async adminLogin(paramObj: UserIdPasswordDto): Promise<PageResObj<User | {}>> {
    const user = await this.userQueryRepo.findOne("id", paramObj.id);
    if (!user) {
      return new PageResObj({}, "존재하지 않는 사용자입니다.", true);
    }
    if (user.password_hash !== hash(paramObj.password)) {
      return new PageResObj({}, "비밀번호가 일치하지 않습니다.", true);
    }
    if (user.is_admin !== 'O') {
      return new PageResObj({}, "관리자가 아닙니다.", true);
    }
    const token = generateAccessToken(user)
    return new PageResObj({ token }, "로그인 성공하였습니다.", false);
  }

  async signUpWallet(public_address: string): Promise<PageResObj<User | {}>> {
    let checkProjectHolder = await this.checkProjectHolder(public_address);
    if (checkProjectHolder.toxicHolder === false && checkProjectHolder.catboticaHolder === false) {
      return new PageResObj(
        { public_address },
        "톡시나 캣보티카 NFT홀더만 가입 가능합니다.",
        true
      );
    }

    const isUnique = await this.userQueryRepo.findOne(
      "public_address",
      public_address
    );
    if (isUnique) {
      return new PageResObj(
        { public_address },
        "이미 존재하는 지갑 주소입니다.",
        true
      );
    }
    const user = {
      public_address: public_address,
      nonce: String(Math.floor(Math.random() * 1000000)),
      point_balance: 0,
    };

    const createResult = await this.userQueryRepo.create(user);
    const result = await this.userQueryRepo.findOne(
      "public_address",
      createResult.identifiers[0].public_address
    );
    return new PageResObj(result, "회원가입에 성공했습니다.");
  }

  async signUpGeneral(public_address: string, paramObj: UserSignUpDto): Promise<PageResObj<{}>> {
    const user = await this.userQueryRepo.findOne("public_address", public_address);
    if (!user) {
      return new PageResObj({}, "존재하지 않는 사용자입니다.", true);
    }

    if (user.id !== null) {
      return new PageResObj({}, "이미 ID가 등록되어 있습니다.", true);
    }

    const isExist = await this.userQueryRepo.findOne("id", paramObj.id);
    if (isExist) {
      return new PageResObj({}, "이미 존재하는 ID입니다.", true);
    }

    // ID 등록
    const updatedUser = await this.userQueryRepo.update({
      toxic_project: paramObj.toxic_project,
      catbotica_project: paramObj.catbotica_project,
      nickname: paramObj.nickname,
      id: paramObj.id,
      password_hash: hash(paramObj.password)
    }, "public_address", public_address)
    if (updatedUser.affected !== 1) {
      return new PageResObj({}, "ID등록에 실패하였습니다.", true);
    }
    return new PageResObj({}, "회원가입에 성공했습니다.");
  }

  async checkProjectHolder(owner: string) {
    const klaytnContracts = [
      process.env.TOXIC_APE,
      // process.env.FOOLKATS,
      // process.env.SUCCUBUS,
      // process.env.TOXIC_APE_SPECIAL,
    ];
    const ethereumContracts = [
      process.env.CATBOTICA
    ];

    let toxicHolder = false;
    let catboticaHolder = false;

    // Tox Holder Check
    for (const contract of klaytnContracts) {
      const res = await axios({
        method: "get",
        url: `https://th-api.klaytnapi.com/v2/contract/nft/${contract}/owner/${owner}`,
        headers: {
          "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
            ? process.env.KLAYTN_API_X_CHAIN_ID
            : "8217",
          Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
        },
      });
      if (res.data.items.length > 0) {
        toxicHolder = true;
      }
    }

    // Catbotica Holder Check
    for (const contract of ethereumContracts) {
      const res = await axios({
        method: "get",
        url: `https://eth-mainnet.g.alchemy.com/nft/v2/${process.env.ALCHEMY_API_KEY}/getNFTs`,
        params: {
          owner: owner,
          'contractAddresses[]': contract,
          withMetadata: 'false'
        },
        headers: {accept: 'application/json'}
      });
      if(res.data.ownedNfts.length > 0) {
        catboticaHolder = true;
      }
    }

    return { toxicHolder, catboticaHolder };
  }

  /**
   * check project holder : toxic, catbotica, meta kongz
   */
  async checkProjectHolderTemplate(owner: string) {
    let toxicHolder = false;
    let catboticaHolder = false;
    let metakongzHolder = false;

    const toxicContracts = [
      process.env.TOXIC_APE
    ]
    const catboticaContracts = [
      process.env.CATBOTICA
    ]
    const metakongzContracts = [
      process.env.METAKONGZ
    ]

    // Check Tox Holder
    for (const contractAddress of toxicContracts) {
      const res = await axios({
        method: "get",
        url: `https://th-api.klaytnapi.com/v2/contract/nft/${contractAddress}/owner/${owner}`,
        headers: {
          "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
            ? process.env.KLAYTN_API_X_CHAIN_ID
            : "8217",
          Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
        },
      });
      if (res.data.items.length > 0) {
        toxicHolder = true;
      }
    }

    // Check Catbotica Holder
    for (const contractAddress of catboticaContracts) {
      const res = await axios({
        method: "get",
        url: `https://eth-mainnet.g.alchemy.com/nft/v2/${process.env.ALCHEMY_API_KEY}/getNFTs`,
        params: {
          owner: owner,
          'contractAddresses[]': contractAddress,
          withMetadata: 'false'
        },
        headers: {accept: 'application/json'}
      });
      if(res.data.ownedNfts.length > 0) {
        catboticaHolder = true;
      }
    }

    // Check Meta-Kongz Holder
    for (const contractAddress of metakongzContracts) {
      const res = await axios({
        method: "get",
        url: `https://eth-mainnet.g.alchemy.com/nft/v2/${process.env.ALCHEMY_API_KEY}/getNFTs`,
        params: {
          owner: owner,
          'contractAddresses[]': contractAddress,
          withMetadata: 'false'
        },
        headers: {accept: 'application/json'}
      });
      if(res.data.ownedNfts.length > 0) {
        catboticaHolder = true;
      }
    }

    return { toxicHolder, catboticaHolder, metakongzHolder };
  }


  async checkHolder(public_address: string): Promise<PageResObj<any>> {
    const projectHolder = await this.checkProjectHolder(public_address);
    const staking = await this.stakingQueryRepo.findOne("user_address", public_address);
    const result = {
      toxicHolder: projectHolder.toxicHolder || staking?.toxic_ape ? 'O' : 'X',
      catboticaHolder: projectHolder.catboticaHolder ? 'O' : 'X',
    }
    return new PageResObj(result, "홀더 체크에 성공하였습니다.")
  }
}
