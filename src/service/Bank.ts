import { Service } from "typedi";
import { EntityManager, Raw, Transaction, TransactionManager } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageReq, PageResList, PageResObj } from "../api";
import { BankDto } from "../dto";
import { Bank, BankLog, User } from "../entity";
import { BankQueryRepo } from "../repository/Bank";
import { BankLogQueryRepo } from "../repository/BankLog";
import { BankLogService } from "./BankLog";

@Service()
export class BankService {
  constructor(
    @InjectRepository()
    readonly bankQueryRepo: BankQueryRepo,
    readonly bankLogService: BankLogService,
  ) {}

  async findAll(param: PageReq): Promise<PageResList<Bank>> {
    const result = await this.bankQueryRepo.findAll(param);
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
    const bank = await this.bankQueryRepo.create(paramObj);
    const result = await this.bankQueryRepo.findOne("id", bank.identifiers[0].id);

    return new PageResObj(result, "Bank 생성에 성공했습니다.");
  }

  async findBankWithUser(param: PageReq, depositor: string): Promise<PageResList<Bank>> {
    const result = await this.bankQueryRepo.findBankWithUser(depositor);
    const ids = result[0].map((el) => el.id);
    const result2 = await this.bankQueryRepo.findBankWithoutUser(ids)

    const arrange = result[0].concat(result2[0]);

    arrange.sort((a, b) => {
      if(a.classDateStart > b.classDateStart) {
        return -1
      }
      if(a.classDateStart < b.classDateStart) {
        return 1
      }
      return 0;
    });

    const skip: number = (param.pageNo - 1) * param.limit;
    const take: number = param.limit;
    const searchResult = arrange.slice(skip, skip + take)

    return new PageResList<Bank>(
      result[1] + result[1],
      param.limit,
      searchResult,
      "Bank 목록을 찾는데 성공했습니다."
    );
  }

  private minusRemaingDay(bank: Bank) {
    bank.remaing_Day = bank.remaing_Day - 1;
  }

  private accumulate(bankLog: BankLog[]) {
    bankLog.forEach((el) => {
      el.accumulate_Interest = el.accumulate_Interest + el.expected_Daily_Interest;
    })
  }

  private async payDeposit(id: number, manager: EntityManager) {
    const bankLog = await manager.findOne(BankLog, id);
    const targetUser = await manager.findOne(User, bankLog.depositor);
 
    targetUser.CF_balance = targetUser.CF_balance + bankLog.deposite_Amount;
    return targetUser;
  }

  @Transaction()
  async payInterestAndDeposit(
    @TransactionManager() manager: EntityManager
  ): Promise<PageResObj<Bank | {}>> {

    const targetBank = await manager.findAndCount(Bank, {
      where: {
        remaing_Day: Raw((day) => `${day} >= 1`)
      },
      relations: ['bank_logs']
    });

    const result = targetBank[0].map( async (bank) => {
      this.minusRemaingDay(bank);
      this.accumulate(bank.bank_logs)

      if(bank.remaing_Day === 0) {
        await Promise.all(bank.bank_logs.map(async (el) => {
          const user  = await this.payDeposit(el.id, manager)
          return await manager.save(User, user);
        })
        )
      }
      return await manager.save(Bank, bank)
    });

    await Promise.all(result)

    return new PageResObj({}, "보상TP 및 예치금 지급에 성공했습니다.");
  }
}
