import { Service } from "typedi";
import { EntityRepository } from "typeorm";
import { Staking } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(Staking)
export class StakingQueryRepo extends BaseQueryRepo {
  constructor() {
    super("staking", "Staking")
  }
}