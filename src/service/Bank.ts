import { Service } from "typedi";
import { EntityManager, Raw, Transaction, TransactionManager } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageReq, PageResList, PageResObj } from "../api";
import { BankDto, BankLogDto } from "../dto";
import { Bank, BankLog, User } from "../entity";
import { BankQueryRepo } from "../repository/Bank";
import { DepositControl } from "./Bank.ctrl";

@Service()
export class BankService {
  constructor(
    @InjectRepository()
    readonly bankQueryRepo: BankQueryRepo
  ) {}

  async findAll(param: PageReq): Promise<PageResList<Bank>> {
    // 관리자 페이지에서 사용되는 뱅크 조회
    const result: [Bank[], number] = await this.bankQueryRepo.findAll(param);
    return new PageResList<Bank>(
      result[1],
      param.limit,
      result[0].map((el: Bank) => {
        return el;
      }),
      "Bank 목록을 찾는데 성공했습니다."
    );
  };

  async create(paramObj: BankDto): Promise<PageResObj<Bank | {}>> {
    // 뱅크 생성
    const bank = await this.bankQueryRepo.create(paramObj);
    const result: Bank = await this.bankQueryRepo.findOne("id", bank.identifiers[0].id);

    return new PageResObj(result, "Bank 생성에 성공했습니다.");
  }

  async findBankWithUser(param: PageReq, depositor: string): Promise<PageResList<Bank>> {
    // 서비스 페이지에서 사용되는 뱅크 조회(해당 사용자의 뱅크 예치 내역이 담김) => sql 쿼리 학습 후 한 번에 조회하고 페이지네이션할 수 있도록 수정할 예정입니다.

    // 종료되지 않은 뱅크
    const depositedBank: [Bank[], number] = await this.bankQueryRepo.findBankWithUser();
    const ids = depositedBank[0].map((bank) => {
      if(bank.bank_logs.length === 0) {
        delete bank.bank_logs;
        return bank;
      } else {
        bank.bank_logs = bank.bank_logs.filter((log) => log.depositor === depositor);
        if(bank.bank_logs.length === 0) delete bank.bank_logs;
        return bank;
      };
    });

    // 종료된 뱅크
    const overDepositedBank: [Bank[], number] = await this.bankQueryRepo.findOverBankWithUser();
    const overIds = overDepositedBank[0].map((bank) => {
      if(bank.bank_logs.length === 0) {
        delete bank.bank_logs;
        return bank;
      } else {
        bank.bank_logs= bank.bank_logs.filter((log) => log.depositor === depositor);
        if(bank.bank_logs.length === 0) delete bank.bank_logs;
        return bank;
      };
    });

    const skip: number = (param.pageNo - 1) * param.limit;
    const take: number = param.limit;
    // 페이지네이션
    const searchResult: Bank[] = ids.concat(overIds).slice(skip, skip + take)

    return new PageResList<Bank>(
      overDepositedBank[1] + depositedBank[1],
      param.limit,
      searchResult,
      "Bank 목록을 찾는데 성공했습니다."
    );
  }

  // 뱅크의 remaing_Day를 하루씩 차감하는 함수
  private minusRemaingDay(bank: Bank): void {
    bank.remaing_Day = bank.remaing_Day - 1;
  }

  // 뱅크가 가진 뱅크 로그에 보상 지급
  private accumulate(bankLog: BankLog[]): void {
    bankLog.forEach((el) => {
      el.accumulate_Interest = el.accumulate_Interest + el.expected_Daily_Interest;
    })
  }

  // 뱅크가 가진 뱅크 로그의 사용자에게 예치금 반환
  private async payDeposit(bankLog: BankLog, manager: EntityManager): Promise<User> {
    const targetUser: User = await manager.findOne(User, bankLog.depositor);
 
    targetUser.CF_balance = targetUser.CF_balance + bankLog.deposit_Amount;
    return targetUser;
  }

  // 예치 중인 사용자에게 일일 보상 지급 및 만기 뱅크 예치금 지급
  @Transaction()
  async payInterestAndDeposit(
    @TransactionManager() manager: EntityManager
  ): Promise<PageResObj<Bank | {}>> {

    // 타겟이 되는 뱅크 찾기 (remaing_Day가 1일 이상으로 남은 뱅크)
    const targetBank: [Bank[], number] = await manager.findAndCount(Bank, {
      where: {
        remaing_Day: Raw((day) => `${day} >= 1`),
        is_over: 'X'
      },
      relations: ['bank_logs']
    });

    const result = targetBank[0].map(async (bank) => {
      // remaing_Day 하루 차감
      this.minusRemaingDay(bank);
      // 해당 뱅크의 뱅크 로그에 보상 지급
      this.accumulate(bank.bank_logs);

      // remaing_Day 차감 후 남은 날이 0인 경우, 뱅크 종료!
      if(bank.remaing_Day === 0) {
        bank.is_over = 'O';
        // 사용자가 예치한 금액 반환
        await Promise.all(bank.bank_logs.map(async (el) => {
          const user: User = await this.payDeposit(el, manager);
          return await manager.save(User, user);
        })
        )
      };
      return await manager.save(Bank, bank);
    });

    await Promise.all(result);

    return new PageResObj({}, "보상TP 및 예치금 지급에 성공했습니다.");
  }

  @Transaction()
  async deposit(paramObj: BankLogDto, depositor: string, @TransactionManager() manager: EntityManager
  ): Promise<PageResObj<BankLog | {}>> {
    // 예치 대상 뱅크 찾기
    const findBank = await manager.findOne(Bank, { where : { id: paramObj.bank_id, is_over: 'X'}, relations: ['bank_logs']});
    // 기존에 예치한 내역이 있는 지 여부 확인
    const findBankLog = await manager.findOne(BankLog, { where : {
      depositor: depositor,
      bank_id: paramObj.bank_id
    }});
    if(findBank.deposit_Total < findBank.deposit_Balance + paramObj.deposit_Amount) return new PageResObj({}, "해당 뱅크의 예치 한도를 초과하는 예치금입니다.", true);
    
    let shareholding;
    const depositCtrl = new DepositControl();
    if(!findBankLog) {
      shareholding = findBank.deposit_Balance === 0 ? 100 : depositCtrl.getShareholing(paramObj.deposit_Amount, findBank.deposit_Balance, paramObj.deposit_Amount);
      depositCtrl.firstDeposit(findBank, paramObj, shareholding, depositor);
    } else {
      findBankLog.deposit_Amount += paramObj.deposit_Amount; // 예치 잔액 변경
      shareholding = depositCtrl.getShareholing(findBankLog.deposit_Amount, findBank.deposit_Balance, paramObj.deposit_Amount);
      depositCtrl.retryDeposit(findBankLog, findBank, paramObj, shareholding);
    };

    if(shareholding !== 100) {
      findBank.bank_logs.map((el) => {
        if(el.depositor !== depositor) {
          depositCtrl.manageOtherDeposit(el, findBank);
        };
      });
    };

    await manager.save(Bank, findBank);
    if(findBankLog) {
      await manager.save(BankLog, findBankLog);
    };

    const result = await manager.findOne(BankLog, { where : {
      depositor: depositor, bank_id: paramObj.bank_id
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
    if(bankLog.accumulate_Interest === 0) return new PageResObj({}, "수령 가능한 누적 보상이 없습니다.", true);
    // 사용자 보상금 지급 및 누적 보상 변경
    user.CF_balance += bankLog.accumulate_Interest;
    bankLog.accumulate_Interest = 0;
    // 사용자 및 뱅크 로그 업데이트
    await manager.update(BankLog, {id: id}, bankLog);
    await manager.update(User, {public_address: depositor}, user);

    const result = await manager.findOne(User, {public_address: depositor});
    return new PageResObj(result, "보상 수령에 성공했습니다.");
  }
}