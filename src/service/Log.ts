import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { LogQueryRepo } from "../repository/Log";
import { Log } from "../entity";
import { PageResList } from "../api";
import { LogSearchReq } from "../api/request/LogSearchReq";
import { RaffleLogQueryRepo } from "../repository/RaffleLog";
import { BidLogQueryRepo } from "../repository/BIdLog";
import { LogClassification } from "../enum";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { LogListSearchReq } from "../api/request/LogListSearchReq";
import { AuctionQueryRepo } from "../repository/Auction";

@Service()
export class LogService {
  constructor(
    @InjectRepository()
    readonly LogQueryRepo: LogQueryRepo,
    readonly raffleLogQueryRepo: RaffleLogQueryRepo,
    readonly bidLogQueryRepo: BidLogQueryRepo,
    readonly auctionQueryRepo: AuctionQueryRepo
  ) {}

  @Transaction()
  async findAllLogs(param: LogListSearchReq, @TransactionManager() manager: EntityManager): Promise<PageResList<any>> {
    // 마켓, 경매, 응모 내역을 규격 하나로 통일
    interface logType {
      classification: LogClassification,
      title: string,
      buyer_id: string,
      seller_id: string,
      amount: number,
      total_point: number
    }

    // 각 마켓, 경매, 응모 로그 수집
    const result = [];
    
    const productLogArr = await manager.query((`SELECT * FROM log`));
    const auctionLogArr = await manager.query(
      `SELECT * FROM auction
       LEFT JOIN user
       ON auction.creator_address = user.public_address
       where auction.is_approved = "O"
       and auction.end_at <= ?
       and auction.title like "%${param.getTitle}%"
       and user.name like "%${param.getName}%"`,
      [new Date()]
    );
    const raffleLog = await manager.query((`SELECT * FROM raffle_log`));

    // created_at 순으로 나열

    
    // 반환
    return new PageResList<any>(
      result.length,
      param.limit,
      result,
      "거래 목록을 찾는데 성공했습니다."
    );
  }
}
