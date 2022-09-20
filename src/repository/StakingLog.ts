import { Service } from "typedi";
import { createQueryBuilder, EntityRepository } from "typeorm";
import { PageReq } from "../api";
import { Bank, StakingLog } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(StakingLog)
export class StakingLogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("staking_log", "StakingLog");
  }
}
