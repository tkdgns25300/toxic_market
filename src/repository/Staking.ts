import { Service } from "typedi";
import { createQueryBuilder, EntityRepository } from "typeorm";
import { PageReq } from "../api";
import { StakingSearchReq } from "../api/request/StakingSearchReq";
import { Staking } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(Staking)
export class StakingQueryRepo extends BaseQueryRepo {
  constructor() {
    super("staking", "Staking")
  }

  findStaking(param: StakingSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("staking")

    builder
    .leftJoinAndSelect("Staking.user_address", "user")
    .select([
      "Staking",
      "user.name"
    ])

    if (param.id) {
      builder.andWhere(`user.id like :id`, {
        id: `${param.id}`
      })
    }

    builder.skip(param.getOffset()).take(param.getLimit());
    return builder.getManyAndCount();
  }
}