import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserQueryRepo } from "../repository/UserQueryRepo";
import { User } from "../entity";
import { PageResObj } from "../api";
import { generateAccessToken } from "../middlewares/AuthMiddleware";
const Caver = require('caver-js')
const caver = new Caver('https://public-node-api.klaytnapi.com/v1/cypress')

@Service()
export class AuthService {
  constructor(
    @InjectRepository()
    readonly userQueryRepo: UserQueryRepo
  ) {}

  async findOne(public_address: string): Promise<PageResObj<User | {}>> {
    const result: User = await this.userQueryRepo.findOne(

      "public_address",
        public_address
    );
    delete result.point_balance;
    return new PageResObj(result, "사용자를 찾는데 성공했습니다.");
  }
  /**
   * if address exists in DB, creates same message as the one that was signed by user
   * subtracts signature from signed message
   * checks if public Address in DB is the same with public address that has signed the message
   * if True, then it creates JWT token with public address and updates nonce value
   * */
  async login(data:{publicAddress: string, signature:string}) {
    const user: User = await this.userQueryRepo.findOne(

        "public_address",
        data.publicAddress.toLowerCase()
    );
    if(!user) {
      return new PageResObj({}, "not found", true);
    }

    const msg = `톡시 마켓 플레이스에 로그인하기 #${user.nonce}`;

    const v = "0x" + data.signature.substring(2).substring(128, 130);
    const r = "0x" + data.signature.substring(2).substring(0, 64);
    const s = "0x" + data.signature.substring(2).substring(64, 128);
    const signature = [v, r, s];
    const isCorrectCredentials = await caver.validator.validateSignedMessage(msg, signature, user.public_address.toLowerCase());

    if(!isCorrectCredentials) {
      return new PageResObj({}, "잘못된 서명입니다. 다시 시도하십시오", true);
    }
    const token = generateAccessToken(user);
    //update nonce value for safety
    user.nonce = Math.floor(Math.random() * 1000000);
    await this.userQueryRepo.update(user, "public_address", user.public_address);
    return new PageResObj({token}, "로그인 성공했습니다.", false);
  }

  async signup(public_address: string): Promise<PageResObj<User | {}>>  {
      //TODO: check if user is holder
      /** CHECK IF USER IS HOLDER */

    const isUnique = await this.userQueryRepo.findOne(
        "public_address",
          public_address
    );
    if (isUnique) {
      return new PageResObj(
          {public_address},
          "이미 존재하는 지갑 주소입니다.",
          true
      );
    }
    const user = {
      public_address: public_address,
      nonce: Math.floor(Math.random() * 1000000),
      point_balance: 0
    }

    const createResult = await this.userQueryRepo.create(
        user
    );
    const result = await this.userQueryRepo.findOne(
        "public_address",
        createResult.identifiers[0].public_address
    );
    return new PageResObj(result, "회원가입에 성공했습니다.");
  }
}
