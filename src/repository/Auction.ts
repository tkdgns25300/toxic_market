import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { Auction } from "../entity";
import { BaseQueryRepo } from "./Base";
import { PageReq } from "../api";
import {AuctionSearchReq} from "../api/request/AuctionSearchReq";
import {convertStringToEntity} from "../util/convertStringToEntity";

@Service()
@EntityRepository(Auction)
export class AuctionQueryRepo extends BaseQueryRepo {
  constructor() { // BaseQueryRepo에서 super의 1번째 인자가 schemaName, 2번째 인자가 schemaClassName
    super("auction", "Auction");
  } 

  async getNewest() {
        let result =await createQueryBuilder("auction")
            .leftJoinAndSelect("Auction.bid_logs", "bid_log")
            .andWhere('is_approved = :is_approved', {
                is_approved: "O"
            })
            .andWhere('start_at < :start_at', {
                start_at: new Date()
            }) // 현재 시점(new Date())보다 과거에 시작된 옥션을 찾음
            .andWhere('end_at > :end_at', {
                end_at: new Date()
            }) // 종료일자가 현재 시점(new Date())보다 미래인 옥션을 찾음
            .orderBy('start_at', 'DESC')
            .getOne();
        const entity_ = convertStringToEntity(this.schemaClassName);
        // convertStringToEntity에 의해서 Aucion 엔티티를 리턴 받는다
        return new entity_().getEntity(this.schemaClassName, result);
    }

  getBidLogs(param: PageReq, address: string): Promise<[Array<any>, number]> {
        return createQueryBuilder("bid_log")
            .leftJoinAndSelect("BidLog.auction_id", "auction")
            .andWhere('BidLog.bidder = :bidder', {
                bidder: address
            })
            .orderBy('BidLog.created_at', 'DESC')
            .skip(param.getOffset())
            .take(param.getLimit())
            .getManyAndCount();
    }

  findAllApproved(param: PageReq): Promise<[Array<any>, number]> {
    return createQueryBuilder("auction")
        .andWhere('is_approved = :is_approved', {
          is_approved: "O"
        })
        .andWhere('start_at < :start_at', {
            start_at: new Date()
        })
        .orderBy('end_at', "DESC")
        .skip(param.getOffset())
        .take(param.getLimit())
        .getManyAndCount();
  }

  findUserAuctions(param: PageReq, creator_address:string): Promise<[Array<any>, number]> {
    return createQueryBuilder("auction")
        .andWhere('creator_address = :creator', {
          creator: creator_address
        })
        .skip(param.getOffset())
        .take(param.getLimit())
        .getManyAndCount();
  }

  findAllNotApproved(param: AuctionSearchReq): Promise<[Array<any>, number]> {
    return createQueryBuilder("auction")
        .leftJoinAndSelect("Auction.creator", "user")
        .where(`user.name like :name`, {
            name: `%${param.getName}%`,
        })
        .andWhere("title like :title", {title: `%${param.getTitle}%`})
        .andWhere('is_approved IS NULL')
        .andWhere('end_at > :end_at', {
            end_at: new Date()
        })
        .skip(param.getOffset())
        .take(param.getLimit())
        .getManyAndCount();
  }

  getAllApprovedAndNotFinished(param: AuctionSearchReq): Promise<[Array<any>, number]> {
        return createQueryBuilder("auction")
            .leftJoinAndSelect("Auction.creator", "user")
            .where(`user.name like :name`, {
                name: `%${param.getName}%`,
            })
            .andWhere("title like :title", {title: `%${param.getTitle}%`})
            .andWhere('is_approved = :is_approved', {
                is_approved: "O"
            })
            .andWhere('end_at > :end_at', {
                end_at: new Date()
            })
            .skip(param.getOffset())
            .take(param.getLimit())
            .getManyAndCount();
    }

  getAllApprovedAndFinished(param: AuctionSearchReq): Promise<[Array<any>, number]> {
        return createQueryBuilder("auction")
            .leftJoinAndSelect("Auction.creator", "user")
            .where(`user.name like :name`, {
                name: `%${param.getName}%`,
            })
            .andWhere("title like :title", {title: `%${param.getTitle}%`})
            .andWhere('is_approved = :is_approved', {
                is_approved: "O"
            })
            .andWhere('end_at <= :end_at', {
                end_at: new Date()
            })
            .skip(param.getOffset())
            .take(param.getLimit())
            .getManyAndCount();
    }

}
