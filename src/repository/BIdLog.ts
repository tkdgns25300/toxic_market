import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { BidLog } from "../entity";
import { BaseQueryRepo } from "./Base";
import { PageReq } from "../api";

@Service()
@EntityRepository(BidLog)
export class BidLogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("bid_log", "BidLog");
  }

  findBuyBidLogs(public_address: string): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("bid_log");

    builder
    .leftJoinAndSelect("BidLog.auction_id", "auction")
    .where(`BidLog.bidder = :public_address`, {
      public_address: public_address,
    })
    .orderBy('BidLog.created_at', 'DESC')

    return builder.getManyAndCount();
  }

  findSellBidLogs(public_address: string): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("bid_log");

    builder
    .leftJoinAndSelect("BidLog.auction_id", "auction")
    .where(`auction.creator_address = :public_address`, {
      public_address: public_address,
    })
    .orderBy('BidLog.created_at', 'DESC')

    return builder.getManyAndCount();
  }
}
