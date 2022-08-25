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
    const result = createQueryBuilder(this.schemaName);
    
    return result
      .skip(param.getOffset())
      .take(param.getLimit())
      .orderBy('Bank.created_at', 'DESC')
      .getManyAndCount();
  }
}
