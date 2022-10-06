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
    
    if (param.getSort === "" || param.getSort === LogClassification.PRODUCT) {
      const productLogArr = await manager.query(
        `SELECT * FROM log
         WHERE title like "%${param.getTitle}%"`
      );
      // 판매자, 구매자 아이디 솔팅
    }

    if (param.getSort === "" || param.getSort === LogClassification.AUCTION) {
      const auctionLogArr = await manager.query(
        `SELECT auction.price, auction.title, auction.created_at, auction.bidder, auction.bid, auction.creator_address, user.id FROM auction
        JOIN user
        ON auction.creator_address = user.public_address
        WHERE auction.is_approved = "O"
        AND auction.is_succeed = "O"
        AND auction.end_at <= ?
        AND auction.title like "%${param.getTitle}%"
        AND user.id like "%${param.getSellerId}%" OR user.id IS NULL`,
        [new Date()]
      );
      // 구매자 아이디 솔팅
    }

    if (param.getSort === "" || param.getSort === LogClassification.RAFFLE) {
      const raffleLogArr = await manager.query(
        `SELECT raffle_log.applicant, raffle_log.amount, raffle_log.created_at, raffle.price, raffle.title, raffle.creator_address FROM raffle_log
        JOIN raffle
        ON raffle_log.raffle_id = raffle.id
        WHERE raffle.title like "%${param.getTitle}%"`
      );
      // 판매자, 구매자 아이디 솔팅
    }


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
