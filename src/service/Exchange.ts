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

//Note that caver.contract sends transactions for deployment and execution. 
//트랜잭션 서명에는 caver.wallet에 있는 Keyring을 사용합니다. 
//사용할 Keyring은 caver.wallet에 먼저 추가해야 합니다.

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
    //caver.contract 객체는 Klaytn 블록체인과 스마트 컨트랙트 간의 상호작용을 쉽게 만들어 줍니다. 
    //새 컨트랙트 객체를 생성할 때 해당 스마트 컨트랙트를 위해 JSON 인터페이스를 제공해야 하는데, 
    //이때 caver-js가 자바스크립트로 작성된 컨트랙트 객체와의 모든 호출을 RPC를 통해 하위 수준의 ABI 호출로 자동 변환시켜줍니다.

    const user: User = await this.userQueryRepo.findOne(
      "public_address", public_address);

    //user.CF_balance = user.CF_balance + amount * 10 * 0.95; // 1 TOX = 10 POINT - 5% commission

    // 톡시 요청으로 수수료 5%에서 0% 변경 건
     user.CF_balance = user.CF_balance + amount * 10
    // commissionFee는 send하지 않음

    const amountOfCoins = BigInt(amount * Math.pow(10, 18)); // 95% of coin COMMISSION 5%
    //const commissionFee = BigInt(amount * 0.05 * Math.pow(10, 18)); // 5% of coin

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
    //sending 5% coin from SavingAccount to Commission Wallet => 불 필요
    //await contractInstance.send(
    //    {
    //      from: keyring.address,
    //      gas: "0x4bfd200",
    //    },
    //    "transferFrom",
    //    public_address,
    //    process.env.COMMISSION_WALLET,
    //    `${commissionFee}`
    //);

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
