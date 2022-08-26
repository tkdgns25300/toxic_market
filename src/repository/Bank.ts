import { Service } from "typedi";
import { Brackets, createQueryBuilder, EntityRepository, getManager } from "typeorm";
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

  findBankWithUser(depositor: string): Promise<[Array<any>, number]> {
    return createQueryBuilder("bank")
      .leftJoinAndSelect("Bank.bank_logs", "bank_logs")
      .where('bank_logs.depositor = :depositor', {
        depositor: depositor
      })
      .getManyAndCount();
  }

  findBankWithoutUser(ids: Array<number>): Promise<[Array<any>, number]> {
    return createQueryBuilder("bank")
      .where('Bank.id Not IN (:...ids)', {
        ids: ids
      })
      .getManyAndCount();
  }
}
