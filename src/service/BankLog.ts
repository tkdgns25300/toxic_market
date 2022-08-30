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

  @Transaction()
  async save(paramObj: BankLogDto, depositor: string, @TransactionManager() manager: EntityManager
  ): Promise<PageResObj<BankLog | {}>> {
    // 예치 대상 뱅크 찾기
    const findBank = await manager.findOne(Bank, paramObj.bank_id, { relations: ['bank_logs']});
    // 기존에 예치한 내역이 있는 지 여부 확인
    const findBankLog = await manager.findOne(BankLog, { where : {
      depositor: depositor,
      bank_id: paramObj.bank_id
    }});

    let shareholding;

    if(!findBankLog) { // 내가 예치한 내역이 없다면
      shareholding = findBank.deposit_Balance === 0 ? 100 : (paramObj.deposit_Amount / (paramObj.deposit_Amount + findBank.deposit_Balance)) * 100 // 지분율
      const bankLog = new BankLog();
      bankLog.bank_id = paramObj.bank_id;
      bankLog.deposit_Amount = paramObj.deposit_Amount;
      bankLog.expected_Daily_Interest = findBank.daily_Interest * shareholding / 100;
      bankLog.expected_EaringRate = ((bankLog.expected_Daily_Interest * findBank.remaing_Day) / paramObj.deposit_Amount) * 100;
      bankLog.depositor = depositor;
      bankLog.remaing_Day = findBank.remaing_Day;

      findBank.bank_logs.push(bankLog);

      findBank.deposit_User = findBank.deposit_User + 1;
      findBank.deposit_Balance = findBank.deposit_Balance + paramObj.deposit_Amount;
    } else {
      // 내가 예치한 내역이 있다면
      findBankLog.deposit_Amount += paramObj.deposit_Amount; // 예치 잔액 변경
      shareholding = ((findBankLog.deposit_Amount) / (paramObj.deposit_Amount + findBank.deposit_Balance)) * 100; // 지분율
      findBankLog.expected_EaringRate = (((findBankLog.expected_Daily_Interest * (findBankLog.remaing_Day - findBank.remaing_Day)) + (findBank.daily_Interest * shareholding / 100 * findBank.remaing_Day)) / findBankLog.deposit_Amount * 100); // 예상 수익률 수정
      findBankLog.expected_Daily_Interest = findBank.daily_Interest * shareholding / 100; // 예상 일일 이자 수정
      findBankLog.remaing_Day = findBank.remaing_Day;
      findBank.deposit_Balance = findBank.deposit_Balance + paramObj.deposit_Amount;
    };
    
    // 뱅크 예치 잔액 및 참여자 수 변경
    if(shareholding !== 100) {
      findBank.bank_logs.map((el) => {
        if(el.depositor !== depositor) {
          const userShareholding = (el.deposit_Amount / findBank.deposit_Balance) * 100;
          el.expected_EaringRate = (((el.expected_Daily_Interest * (el.remaing_Day - findBank.remaing_Day)) + (findBank.daily_Interest * userShareholding / 100 * findBank.remaing_Day)) / el.deposit_Amount * 100); // 예상 수익률 수정
          el.expected_Daily_Interest = findBank.daily_Interest * userShareholding / 100;
        };
      });
    };

    await manager.save(Bank, findBank);
    if(findBankLog) {
      await manager.save(BankLog, findBankLog);
    };

    const result = await manager.findOne(BankLog, { where : {
      depositor: depositor
    }});
    return new PageResObj(result, "BankLog 생성에 성공했습니다.");
  }

  @Transaction()
  async withdraw(
    id: number, 
    depositor: string,
    @TransactionManager() manager: EntityManager
  ): Promise<PageResObj<BankLog | {}>> {
    // 누적 보상 수령 사용자 찾기
    const user: User = await manager.findOne(User, {
      public_address: depositor
    });
    // 보상 수령 대상 뱅크 로그 찾기
    const bankLog: BankLog = await manager.findOne(BankLog, {
      id: id });
    // 사용자 보상금 지급 및 누적 보상 변경
    user.CF_balance += bankLog.accumulate_Interest;
    bankLog.accumulate_Interest = 0;
    // 사용자 및 뱅크 로그 업데이트
    await manager.update(BankLog, {id: id}, bankLog);
    await manager.update(User, {public_address: depositor}, user);

    return new PageResObj(user, "보상 수령에 성공했습니다.");
  }
}
