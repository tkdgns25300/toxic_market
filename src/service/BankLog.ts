import { Service } from "typedi";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageResObj } from "../api";
import { BankLogDto } from "../dto";
import { Bank, BankLog, User } from "../entity";
import { BankQueryRepo } from "../repository/Bank";
import { BankLogQueryRepo } from "../repository/BankLog";
import { UserQueryRepo } from "../repository/User";

@Service()
export class BankLogService {
  constructor(
    @InjectRepository()
    readonly bankLogQueryRepo: BankLogQueryRepo,
    readonly bankQueryRepo: BankQueryRepo,
    readonly userQueryRepo: UserQueryRepo,
  ) {}

  async create(paramObj: BankLogDto): Promise<PageResObj<BankLog | {}>> {    
    const findBank = await this.bankQueryRepo.findOne('id', paramObj.bank_id);
    paramObj['expected_Daily_Interest'] = findBank.daily_Interest * (paramObj.deposite_Amount / findBank.deposit_Total);
    paramObj['expected_InterestRate'] = (findBank.remaing_Day * paramObj['expected_Daily_Interest'] / paramObj.deposite_Amount) * 100;


    const bankLog = await this.bankLogQueryRepo.create(paramObj);
    findBank[1].deposit_User = findBank[1].deposit_User + 1;
    findBank[1].deposit_Balance = findBank[1].deposit_Balance + paramObj.deposite_Amount;

    await this.bankQueryRepo.update(findBank, 'id', paramObj.bank_id);
    const result = await this.bankLogQueryRepo.findOne("id", bankLog.identifiers[0].id);
    await this.bankQueryRepo.findOne('id', paramObj.bank_id);
    return new PageResObj(result, "BankLog 생성에 성공했습니다.");
  }

  @Transaction()
  async withdraw(
    id: number, 
    depositor: string,
    @TransactionManager() manager: EntityManager
  ): Promise<PageResObj<BankLog | {}>> {
    const user: User = await manager.findOne(User, {
      public_address: depositor
    });

    const bankLog = await manager.findOne(BankLog, {
      id: id });
    user.CF_balance += bankLog.accumulate_Interest;
    bankLog.accumulate_Interest = 0;

    console.log(user)
    await manager.update(User, {public_address: depositor}, user);
    await manager.update(BankLog, {id: id}, bankLog);

    return new PageResObj(user, "보상 수령에 성공했습니다.");
  }
}
