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
  constructor() {
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
            })
            .andWhere('end_at > :end_at', {
                end_at: new Date()
            })
            .orderBy('start_at', 'DESC')
            .getOne();
        const entity_ = convertStringToEntity(this.schemaClassName);
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
        const builder = createQueryBuilder("auction");

        builder
        .leftJoinAndSelect("Auction.creator", "user")
        .where(`user.name like :name`, {
            name: `%${param.getName}%`,
        })
        .andWhere("title like :title", {title: `%${param.getTitle}%`})
        .andWhere('is_approved IS NULL')
        .andWhere('end_at > :end_at', {
            end_at: new Date()
        })

        if (param.getUserToxicProject) {
            builder.andWhere(`user.toxic_project = :toxic_project`, {toxic_project: param.getUserToxicProject})
        }
        if (param.getUserCatboticaProject) {
            builder.andWhere(`user.catbotica_project = :catbotica_project`, {catbotica_project: param.getUserCatboticaProject})
        }

        builder.skip(param.getOffset()).take(param.getLimit());
        return builder.getManyAndCount();
    }

    getAllApprovedAndNotFinished(param: AuctionSearchReq): Promise<[Array<any>, number]> {
        const builder = createQueryBuilder("auction");

        builder
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

        if (param.getUserToxicProject) {
            builder.andWhere(`user.toxic_project = :toxic_project`, {toxic_project: param.getUserToxicProject})
        }
        if (param.getUserCatboticaProject) {
            builder.andWhere(`user.catbotica_project = :catbotica_project`, {catbotica_project: param.getUserCatboticaProject})
        }

        builder.skip(param.getOffset()).take(param.getLimit());
        return builder.getManyAndCount();
    }

    getAllApprovedAndFinished(param: AuctionSearchReq): Promise<[Array<any>, number]> {
        const builder = createQueryBuilder("auction");

        builder
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

        if (param.getUserToxicProject) {
            builder.andWhere(`user.toxic_project = :toxic_project`, {toxic_project: param.getUserToxicProject})
        }
        if (param.getUserCatboticaProject) {
            builder.andWhere(`user.catbotica_project = :catbotica_project`, {catbotica_project: param.getUserCatboticaProject})
        }

        builder.skip(param.getOffset()).take(param.getLimit());
        return builder.getManyAndCount();    
    }
}
