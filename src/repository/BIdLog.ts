import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { BidLog } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(BidLog)
export class BidLogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("bid_log", "BidLog");
  }

}
