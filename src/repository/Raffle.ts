import { Service } from "typedi";
import { createQueryBuilder, EntityRepository } from "typeorm";
import { RaffleSearchReq } from "../api/request/RaffleSearchReq";
import { Raffle } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(Raffle)
export class RaffleQueryRepo extends BaseQueryRepo {
  constructor() {
    super("raffle", "Raffle")
  }

  findAllNotApproved(param: RaffleSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle");
    
    builder
    .leftJoinAndSelect("Raffle.creator", "user")
    .where('is_approved IS NULL')
    .andWhere('start_at > :start_at', {
      start_at: new Date()
    })

    if (param.name) {
      builder.andWhere('name like :name', { name: `%${param.name}%` });
    }
    if (param.title) {
      builder.andWhere('title like :title', { title: `%${param.title}%` });
    }
    
    builder.skip(param.getOffset()).take(param.getLimit());
    return builder.getManyAndCount();
  }
}