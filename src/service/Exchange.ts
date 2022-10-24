import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import Caver from "caver-js";
import { UserQueryRepo } from "../repository/User";
import { ExchangeLog, User } from "../entity";
import { PageResList, PageResObj } from "../api";
import { ABI, TOX_CONTRACT_ADDRESS } from "../middlewares/smartContract";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { UserType } from "../enum";
import { ExchangeLogQueryRepo } from "../repository/ExchangeLog";
import { ProjectSortingSearchReq } from "../api/request/ProjectSortingSearchReq";
import { CommissionReq } from "../api/request/CommissionReq";

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
    readonly userQueryRepo: UserQueryRepo,
    readonly exchangeLogQueryRepo: ExchangeLogQueryRepo
  ) {}


  async toxToPoint(amount: number, public_address: string): Promise<PageResObj<User | {}>> {
    // @ts-ignore
    const contractInstance = caver.contract.create(ABI, TOX_CONTRACT_ADDRESS);
    const user: User = await this.userQueryRepo.findOne("public_address", public_address);

    // user.CF_balance = user.CF_balance + amount * 10 * 0.95; // 1 TOX = 10 POINT - 5% commission
    user.CF_balance = user.CF_balance + amount * 10 * 1; // NO COMMISSION

    // const amountOfCoins = BigInt(amount * 0.95 * Math.pow(10, 18)); // 95% of coin COMMISSION 5%
    // const commissionFee = BigInt(amount * 0.05 * Math.pow(10, 18)); // 5% of coin
    const amountOfCoins = BigInt(amount * 1 * Math.pow(10, 18)); // NO COMMISSION

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
    /**
     * NO COMMISSION
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
    */

    // Create Exchange Log
    const exchangeLog = {
      user_type: user.is_seller === 'O' ? UserType.SELLER : UserType.GENERAL,
      user_toxic_project: user.toxic_project,
      user_catbotica_project: user.catbotica_project,
      user_id: user.id,
      exchange_point: amount * 10,
      exchange_coin: 0,
      commission: 0,
      return_commission: 0,
      creator_address: user.public_address
    }
    await this.exchangeLogQueryRepo.create(exchangeLog)

    return new PageResObj(user, "TOX 코인을 포인트로 교환하는데 성공했습니다.");
  }

  @Transaction()
  async pointToTox(point_amount: number, public_address: string, @TransactionManager() manager: EntityManager): Promise<PageResObj<User | {}>> {
    const user: User = await manager.findOne(User, { public_address: public_address });
    // 1. 포인트 감소
    if (point_amount < 1000) return new PageResObj({}, "1000TP 이상부터 TOX 코인으로 교환 가능합니다.", true);
    if (user.CF_balance < point_amount) {
      return new PageResObj({}, "포인트가 부족합니다.");
    }
    user.CF_balance = user.CF_balance - point_amount;
    await manager.update(User, public_address, user);

    // 2. Transaction Send
    const amountOfCoins = BigInt(point_amount * 0.090 * Math.pow(10, 18)); // 9% of pointAmount
    const commissionFee = BigInt(point_amount * 0.010 * Math.pow(10, 18)); // 1% of pointAmount
    // @ts-ignore
    const contractInstance = caver.contract.create(ABI, TOX_CONTRACT_ADDRESS);
    //sending 90% coin from SaveAccount to User
    await contractInstance.send(
      {
        from: keyring.address,
        gas: "0x4bfd200",
      },
      "transfer",
      public_address,
      `${amountOfCoins}`
    );
    //sending 10% coin from SavingAccount to Commission Wallet
    await contractInstance.send(
      {
        from: keyring.address,
        gas: "0x4bfd200",
      },
      "transfer",
      process.env.COMMISSION_WALLET,
      `${commissionFee}`
    );

    // 3. Create Exchange Log
    const exchangeLog = {
      user_type: user.is_seller === 'O' ? UserType.SELLER : UserType.GENERAL,
      user_toxic_project: user.toxic_project,
      user_catbotica_project: user.catbotica_project,
      user_id: user.id,
      exchange_point: 0,
      exchange_coin: point_amount * 0.09,
      commission: point_amount * 0.1,
      return_commission: 0,
      creator_address: user.public_address
    }
    const log = manager.create(ExchangeLog, exchangeLog)
    await manager.save(ExchangeLog, log)

    return new PageResObj(user, "포인트를 TOX 코인으로 교환하는데 성공했습니다.");
  }

  /**
   * Point to Tox Exchange Template
   */
   @Transaction()
   async pointToToxTemplate(point_amount: number, public_address: string, @TransactionManager() manager: EntityManager): Promise<PageResObj<User | {}>> {
    const user: User = await manager.findOne(User, { public_address: public_address });

    // 1. 유저 포인트 감소
    if (point_amount < 1000) return new PageResObj({}, "1000TP 이상부터 TOX 코인으로 교환 가능합니다.", true);
    if (user.CF_balance < point_amount) {
      return new PageResObj({}, "포인트가 부족합니다.");
    }
    user.CF_balance = user.CF_balance - point_amount;
    await manager.update(User, public_address, user);

    // 2. Transaction Send
    // @ts-ignore
    const contractInstance = caver.contract.create(ABI, TOX_CONTRACT_ADDRESS);
    const amountOfCoins = BigInt(point_amount * 0.090 * Math.pow(10, 18)); // 9% of pointAmount
    //sending 90% coin from SaveAccount to User
    await contractInstance.send(
      {
        from: keyring.address,
        gas: "0x4bfd200",
      },
      "transfer",
      public_address,
      `${amountOfCoins}`
    );

    //sending 10% coin from SavingAccount to Commission Wallet
    if (user.toxic_project === 'O') {
      const commissionFee = BigInt(point_amount * 0.010 * Math.pow(10, 18)); // 1% of pointAmount
      //sending 10% coin from SavingAccount to Commission Wallet
      await contractInstance.send(
        {
          from: keyring.address,
          gas: "0x4bfd200",
        },
        "transfer",
        process.env.COMMISSION_WALLET,
        `${commissionFee}`
      );
    }
    else if (user.catbotica_project === 'O') {
      const commissionFeeTox = BigInt(point_amount * 0.004 * Math.pow(10, 18)); // 0.4% of pointAmount
      const commissionFeeCatbotica = BigInt(point_amount * 0.003 * Math.pow(10, 18)); // 0.3% of pointAmount
      const commissionFeeBroker = BigInt(point_amount * 0.003 * Math.pow(10, 18)); // 0.3% of pointAmount
      /**
       * send commission to Tox, Catbotica, Broker wallet
       */
    }

    // 3. Create Exchange Log
    const exchangeLog = {
      user_type: user.is_seller === 'O' ? UserType.SELLER : UserType.GENERAL,
      user_toxic_project: user.toxic_project,
      user_catbotica_project: user.catbotica_project,
      user_id: user.id,
      exchange_point: 0,
      exchange_coin: point_amount * 0.09,
      commission: point_amount * 0.1,
      return_commission: 0,
      creator_address: user.public_address
    }
    const log = manager.create(ExchangeLog, exchangeLog)
    await manager.save(ExchangeLog, log)

    return new PageResObj(user, "포인트를 TOX 코인으로 교환하는데 성공했습니다.");
  }

  async findExchangeLogs(paramObj: ProjectSortingSearchReq): Promise<PageResList<ExchangeLog>> {
    const result = await this.exchangeLogQueryRepo.findExchangeLogs(paramObj);
    return new PageResList<ExchangeLog>(
      result[1],
      paramObj.limit,
      result[0].map((el: ExchangeLog) => {
        return el;
      }),
      "Exchange Log 목록을 찾는데 성공했습니다."
    );
  }

  async findExchangeLogsById(id: number): Promise<PageResObj<ExchangeLog>> {
    const result = await this.exchangeLogQueryRepo.findOne("id", id);
    return new PageResObj(result, "Exchange Log를 찾는데 성공했습니다.")
  }

  @Transaction()
  async returnCommissionById(id: number, paramObj: CommissionReq, @TransactionManager() manager: EntityManager): Promise<PageResObj<{}>> {
    const exchangeLog: ExchangeLog = await manager.findOne(ExchangeLog, id)

    if (paramObj.returnCommissionFee > exchangeLog.commission - exchangeLog.return_commission) {
      return new PageResObj({}, "수수료보다 낮은 금액을 입력해주세요.", true)
    }

    if (!Number.isInteger(paramObj.returnCommissionFee)) {
      return new PageResObj({}, "자연수만 입력해주세요.", true)
    }

    // 1. 유저에게 TP 지급
    const user: User = await manager.findOne(User, { "public_address": exchangeLog.creator_address})
    user.CF_balance += paramObj.returnCommissionFee;
    await manager.update(User, { "public_address": exchangeLog.creator_address }, user);
    
    // 2. Exchange Log 수정
    exchangeLog.return_commission += paramObj.returnCommissionFee;
    await manager.update(ExchangeLog, exchangeLog.id, exchangeLog);

    return new PageResObj({}, "수수료가 반환되었습니다.")
  } 
}