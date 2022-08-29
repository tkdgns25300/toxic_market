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

  async save(paramObj: BankLogDto, depositor: string): Promise<PageResObj<BankLog | {}>> {
    // 예치 대상 뱅크 찾기
    const findBank = await this.bankQueryRepo.findOne('id', paramObj.bank_id);
    // 기존에 예치한 내역이 있는 지 여부 확인
    const findBankLog = await this.bankLogQueryRepo.findOneWithTwoCondition(['depositor', 'bank_id'], [depositor, paramObj.bank_id]);

    // // 기존에 예치한 내역이 있으면 update
    // if(findBankLog) {
    //   // 기존 예치 금액과 현재 예치 요청 금액의 합이 뱅크의 예치 가능 금액보다 클 경우 에러 발생
    //   if(findBank.deposit_Total < findBank.deposit_Balance + paramObj.deposit_Amount) throw new Error("BankLog 생성에 실패했습니다.");
      
    //   // 기존의 예치 내역 업데이트
    //   findBankLog.deposit_Amount += paramObj.deposit_Amount;
    //   const currentRate: number = (paramObj.deposit_Amount / findBank.deposit_Total);
    //   const currentDailyInterest = findBank.daily_Interest * currentRate;
    //   findBankLog.expected_Daily_Interest += currentDailyInterest;
    //   findBankLog.expected_EaringRate = ((((findBankLog.deposit_Amount - paramObj.deposit_Amount) * (findBankLog.expected_EaringRate / 100)) + currentDailyInterest * findBank.remaing_Day) / (findBankLog.deposit_Amount)) * 100

    //   // 뱅크 예치 잔액 변경
    //   findBank.deposit_Balance = findBank.deposit_Balance + paramObj.deposit_Amount;

    //   // 뱅크, 뱅크로그 업데이트
    //   await this.bankQueryRepo.update(findBank, 'id', findBank.id);
    //   await this.bankLogQueryRepo.update(findBankLog, 'id', findBankLog.id);

    //   const result = await this.bankLogQueryRepo.findOne("id", findBankLog.id);
    //   return new PageResObj(result, "BankLog 생성에 성공했습니다.");
    // };

    // 기존에 예치 내역이 없다면 새롭게 생성
    // 뱅치 예금 가능 금액보다 현재 예치 요청 금액이 클 경우 에러 발생
    // if(findBank.deposit_Total < paramObj.deposit_Amount) throw new Error("BankLog 생성에 실패했습니다.");

    // 일일 이자액 및 총 수익률 계산 후 뱅크 로그 생성
    // paramObj['expected_Daily_Interest'] = findBank.daily_Interest * (paramObj.deposit_Amount / findBank.deposit_Total);
    // paramObj['expected_EaringRate'] = (findBank.remaing_Day * paramObj['expected_Daily_Interest'] / paramObj.deposit_Amount) * 100;
    
    const sharehloding = findBank.deposit_Balance === 0 ? 1 : (paramObj.deposit_Amount / (paramObj.deposit_Amount + findBank.deposit_Balance)) * 100 // 지분율

    console.log('findBank.deposit_Balance :', findBank.deposit_Balance)
    console.log('sharehloding :', sharehloding)
    paramObj['expected_Daily_Interest'] = findBank.daily_Interest * sharehloding / 100;
    console.log('paramObj :', paramObj)
    paramObj['expected_EaringRate'] = ((paramObj['expected_Daily_Interest'] * findBank.remaing_Day) / paramObj.deposit_Amount) * 100; 
    console.log('paramObj :', paramObj)

    paramObj['depositor'] = depositor;
    const bankLog = await this.bankLogQueryRepo.create(paramObj);

    // 뱅크 예치 잔액 및 참여자 수 변경
    findBank.deposit_User = findBank.deposit_User + 1;
    findBank.deposit_Balance = findBank.deposit_Balance + paramObj.deposit_Amount;

    // 뱅크 업데이트
    await this.bankQueryRepo.update(findBank, 'id', paramObj.bank_id);
    const result = await this.bankLogQueryRepo.findOne("id", bankLog.identifiers[0].id);
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
