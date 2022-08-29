import { Service } from "typedi";
import { EntityManager, Raw, Transaction, TransactionManager } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageReq, PageResList, PageResObj } from "../api";
import { BankDto } from "../dto";
import { Bank, BankLog, User } from "../entity";
import { BankQueryRepo } from "../repository/Bank";
import { BankLogService } from "./BankLog";

@Service()
export class BankService {
  constructor(
    @InjectRepository()
    readonly bankQueryRepo: BankQueryRepo,
    readonly bankLogService: BankLogService,
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

    // 사용자가 예치 중인 뱅크
    const depositedBank: [Bank[], number] = await this.bankQueryRepo.findBankWithUser(depositor);
    const ids: number[] = depositedBank[0].map((el) => el.id);
    // 사용자가 예치 중이지 않은 뱅크
    const undepositedBank: [Bank[], number] = await this.bankQueryRepo.findBankWithoutUser(ids);
    // 종료된 뱅크
    const overBank: [Bank[], number] = await this.bankQueryRepo.findOverBank();


    // 예치 중인 뱅크와 예치 중이지 않는 뱅크 정렬
    const arrange: Bank[] = depositedBank[0].concat(undepositedBank[0]).sort((a, b) => {
      if(a.created_at > b.created_at) {
        return -1;
      }
      if(a.created_at < b.created_at) {
        return 1;
      }
      return 0;
    });

    const skip: number = (param.pageNo - 1) * param.limit;
    const take: number = param.limit;
    // 페이지네이션
    const searchResult: Bank[] = arrange.concat(overBank[0]).slice(skip, skip + take)

    return new PageResList<Bank>(
      depositedBank[1] + undepositedBank[1] + overBank[1],
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
    // const bankLog: BankLog = await manager.findOne(BankLog, id);
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
        remaing_Day: Raw((day) => `${day} >= 1`)
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
}
