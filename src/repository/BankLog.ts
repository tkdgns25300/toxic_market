import { Service } from "typedi";
import { EntityRepository } from "typeorm";
import { BankLog } from "../entity/BankLog";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(BankLog)
export class BankLogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("bank_log", "BankLog");
  }
}
