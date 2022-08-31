import { Service } from "typedi";
import { createQueryBuilder, EntityRepository } from "typeorm";
import { PageReq } from "../api";
import { Bank } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(Bank)
export class BankQueryRepo extends BaseQueryRepo {
  constructor() {
    super("bank", "Bank");
  }

  findAll(param: PageReq): Promise<[Array<any>, number]>  {
    const result = createQueryBuilder("bank");
    
    return result
      .skip(param.getOffset())
      .take(param.getLimit())
      .orderBy('Bank.created_at', 'DESC')
      .getManyAndCount();
  }

  findBankWithUser(): Promise<[Array<any>, number]> {
    return createQueryBuilder("bank")
      .leftJoinAndSelect("Bank.bank_logs", "bank_logs")
      .where(`is_over = 'X'`)
      .orderBy('created_at', "DESC")
      .getManyAndCount();
  }

  findOverBankWithUser(): Promise<[Array<any>, number]> {
    return createQueryBuilder("bank")
      .leftJoinAndSelect("Bank.bank_logs", "bank_logs")
      .andWhere(`is_over = 'O'`)
      .orderBy('created_at', "DESC")
      .getManyAndCount();
  }
}
