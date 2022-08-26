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
}
