import { Service } from "typedi";
import { EntityRepository } from "typeorm";
import { BankLog } from "../entity/BankLog";
import { BaseQueryRepo } from "./Base";
import { createQueryBuilder } from "typeorm";
import { convertStringToEntity } from "../util/convertStringToEntity";

@Service()
@EntityRepository(BankLog)
export class BankLogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("bank_log", "BankLog");
  }
  async findOneWithTwoCondition(
    whereKey: string[],
    whereValue: [string, number]
  ) {
    const query = createQueryBuilder(this.schemaName);

    const result = await query
      .where(`${this.schemaClassName}.${whereKey[0]} = :${whereKey[0]}`, {
        [whereKey[0]]: whereValue[0],
      })
      .andWhere(`${this.schemaClassName}.${whereKey[1]} = :${whereKey[1]}`, {
        [whereKey[1]]: whereValue[1],
      })
      .getOne();

    const entity_ = convertStringToEntity(this.schemaClassName);
    return new entity_().getEntity(this.schemaClassName, result);
  }
}
