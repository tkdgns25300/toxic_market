import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { LogQueryRepo } from "../repository/Log";
import { Log, User } from "../entity";
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
      total_point: number,
      created_at: string
    }

    // 각 마켓, 경매, 응모 로그 수집
    let result = [];
    
    if (param.getSort === "" || param.getSort === LogClassification.PRODUCT) {
      let productLog: logType[] = [];
      const productLogRawArr = await manager.query(
        `SELECT * FROM log
         WHERE title like "%${param.getTitle}%"`
      );
      // 판매자, 구매자 아이디 솔팅
      for (const data of productLogRawArr) {
        const buyer = await manager.findOne(User, { public_address: data.buyer })
        const seller = await manager.findOne(User, { public_address: data.seller })
        const log: logType = {
          classification: LogClassification.PRODUCT,
          title: data.title,
          buyer_id: buyer.id,
          seller_id: seller.id,
          amount: data.amount,
          total_point: data.total_CF,
          created_at: data.created_at
        }
        productLog.push(log)
      }
      productLog = productLog.filter(log => {
        let isInclude = true;
        if (param.getBuyerId !== "" && (log.buyer_id === null || (log.buyer_id && !log.buyer_id?.includes(param.getBuyerId)))) isInclude = false
        else if (param.getSellerId !== "" && (log.seller_id === null || (log.seller_id && !log.seller_id?.includes(param.getSellerId)))) isInclude = false
        return isInclude;
      })
      result = result.concat(productLog)
    }

    if (param.getSort === "" || param.getSort === LogClassification.AUCTION) {
      let auctionLog: logType[] = [];
      const auctionLogRawArr = await manager.query(
        `SELECT auction.price, auction.title, auction.created_at, auction.bidder, auction.bid, auction.creator_address FROM auction
        WHERE is_approved = "O"
        AND is_succeed = "O"
        AND end_at <= ?
        AND title like "%${param.getTitle}%"`,
        [new Date()]
      );
      // 판매자, 구매자 아이디 솔팅
      for (const data of auctionLogRawArr) {
        const buyer = await manager.findOne(User, { public_address: data.bidder })
        const seller = await manager.findOne(User, { public_address: data.creator_address })
        const log: logType = {
          classification: LogClassification.AUCTION,
          title: data.title,
          buyer_id: buyer.id,
          seller_id: seller.id,
          amount: 1,
          total_point: data.bid,
          created_at: data.created_at
        }
        auctionLog.push(log)
      }
      auctionLog = auctionLog.filter(log => {
        let isInclude = true;
        if (param.getBuyerId !== "" && (log.buyer_id === null || (log.buyer_id && !log.buyer_id?.includes(param.getBuyerId)))) isInclude = false
        else if (param.getSellerId !== "" && (log.seller_id === null || (log.seller_id && !log.seller_id?.includes(param.getSellerId)))) isInclude = false
        return isInclude;
      })
      result = result.concat(auctionLog)
    }

    if (param.getSort === "" || param.getSort === LogClassification.RAFFLE) {
      let raffleLog: logType[] = [];
      const raffleLogRawArr = await manager.query(
        `SELECT raffle_log.applicant, raffle_log.amount, raffle_log.created_at, raffle.price, raffle.title, raffle.creator_address FROM raffle_log
        JOIN raffle
        ON raffle_log.raffle_id = raffle.id
        WHERE raffle.title like "%${param.getTitle}%"`
      );
      // 판매자, 구매자 아이디 솔팅
      for (const data of raffleLogRawArr) {
        const buyer = await manager.findOne(User, { public_address: data.applicant })
        const seller = await manager.findOne(User, { public_address: data.creator_address })
        const log: logType = {
          classification: LogClassification.RAFFLE,
          title: data.title,
          buyer_id: buyer.id,
          seller_id: seller.id,
          amount: data.amount,
          total_point: data.amount * data.price,
          created_at: data.created_at
        }
        raffleLog.push(log)
      }
      raffleLog = raffleLog.filter(log => {
        let isInclude = true;
        if (param.getBuyerId !== "" && (log.buyer_id === null || (log.buyer_id && !log.buyer_id?.includes(param.getBuyerId)))) isInclude = false
        else if (param.getSellerId !== "" && (log.seller_id === null || (log.seller_id && !log.seller_id?.includes(param.getSellerId)))) isInclude = false
        return isInclude;
      })
      result = result.concat(raffleLog)
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
