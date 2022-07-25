import { EntityRepository } from "typeorm";
import { Service } from "typedi";
import { RaffleLog } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(RaffleLog)
export class RaffleLogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("rafflt_log", "RaffleLog");
  }
}
