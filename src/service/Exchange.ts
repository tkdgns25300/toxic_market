import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import Caver from "caver-js";
import { UserQueryRepo } from "../repository/User";
import { User } from "../entity";
import { PageResObj } from "../api";
import { ABI, TOX_CONTRACT_ADDRESS } from "../middlewares/smartContract";
import { EntityManager, Transaction, TransactionManager } from "typeorm";

const caver = new Caver("https://public-node-api.klaytnapi.com/v1/cypress");
//const caver = new Caver('https://api.baobab.klaytn.net:8651/')

const keyring = caver.wallet.keyring.createFromPrivateKey(
  process.env.WALLET_PRIVATE_KEY
);
caver.wallet.add(keyring);

@Service()
export class ExchangeService {
  constructor(
    @InjectRepository()
    readonly userQueryRepo: UserQueryRepo
  ) {}


  async toxToPoint(
    amount: number,
    public_address: string
  ) {
    // @ts-ignore
    const contractInstance = caver.contract.create(ABI, TOX_CONTRACT_ADDRESS);
    const user: User = await this.userQueryRepo.findOne(
      "public_address", public_address);

    user.CF_balance = user.CF_balance + amount * 10 * 0.95; // 1 TOX = 10 POINT - 5% commission


    const amountOfCoins = BigInt(amount * 0.95 * Math.pow(10, 18)); // 95% of coin COMMISSION 5%
    const commissionFee = BigInt(amount * 0.05 * Math.pow(10, 18)); // 5% of coin

    //sending coin from user to Save Account
    await contractInstance.send(
      { from: keyring.address, gas: "0x4bfd200" },
      "transferFrom",
      public_address,
      keyring.address,
        `${amountOfCoins}`
    );
    //update user CF_balance right after coin was transferred
    await this.userQueryRepo.update(user, "public_address", public_address);
    //sending 5% coin from SavingAccount to Commission Wallet
    await contractInstance.send(
        {
          from: keyring.address,
          gas: "0x4bfd200",
        },
        "transferFrom",
        public_address,
        process.env.COMMISSION_WALLET,
        `${commissionFee}`
    );

    return new PageResObj(user, "TOX 코인을 포인트로 교환하는데 성공했습니다.");
  }

  @Transaction()
  async pointToTox(
    point_amount: number,
    public_address: string,
    @TransactionManager() manager: EntityManager
  ) {
    const user: User = await manager.findOne(User, {
      public_address: public_address,
    });
    if (user.CF_balance < point_amount) {
      return new PageResObj({}, "포인트가 부족합니다.");
    }
    user.CF_balance = user.CF_balance - point_amount;
    await manager.update(User, public_address, user);
    const amountOfCoins = BigInt(point_amount * 0.090 * Math.pow(10, 18)); // 9% of pointAmount COMMISSION 3%
    const commissionFee = BigInt(point_amount * 0.010 * Math.pow(10, 18)); // 1% of pointAmount
    // @ts-ignore
    const contractInstance = caver.contract.create(ABI, TOX_CONTRACT_ADDRESS);
    //sending 97% coin from SaveAccount to User
    await contractInstance.send(
      {
        from: keyring.address,
        gas: "0x4bfd200",
      },
      "transfer",
      public_address,
      `${amountOfCoins}`
    );
    //sending 3% coin from SavingAccount to Commission Wallet
    await contractInstance.send(
      {
        from: keyring.address,
        gas: "0x4bfd200",
      },
      "transfer",
      process.env.COMMISSION_WALLET,
      `${commissionFee}`
    );
    return new PageResObj(
      user,
      "포인트를 TOX 코인으로 교환하는데 성공했습니다."
    );
  }
}
