import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { Auction } from "../entity";
import { BaseQueryRepo } from "./Base";
import { PageReq } from "../api";

@Service()
@EntityRepository(Auction)
export class AuctionQueryRepo extends BaseQueryRepo {
  constructor() {
    super("auction", "Auction");
  }

  findAllApproved(param: PageReq): Promise<[Array<any>, number]> {
    return createQueryBuilder("auction")
        .andWhere('is_approved = :is_approved', {
          is_approved: true
        })
        .skip(param.getOffset())
        .take(param.getLimit())
        .getManyAndCount();
  }

  findUserAuctions(param: PageReq, creator_address:string): Promise<[Array<any>, number]> {
    return createQueryBuilder("auction")
        .andWhere('creator = :creator', {
          creator: creator_address
        })
        .skip(param.getOffset())
        .take(param.getLimit())
        .getManyAndCount();
  }

  findAllNotApproved(param: PageReq): Promise<[Array<any>, number]> {
    return createQueryBuilder("auction")
        .leftJoinAndSelect("Auction.creator", "user")
        .andWhere('is_approved = :is_approved', {
          is_approved: false
        })
        .skip(param.getOffset())
        .take(param.getLimit())
        .getManyAndCount();
  }
    getAllApprovedAndNotFinished(param: PageReq): Promise<[Array<any>, number]> {
        return createQueryBuilder("auction")
            .leftJoinAndSelect("Auction.creator", "user")
            .andWhere('is_approved = :is_approved', {
                is_approved: true
            })
            .andWhere('end_at < :end_at', {
                end_at: new Date()
            })
            .skip(param.getOffset())
            .take(param.getLimit())
            .getManyAndCount();
    }
    getAllApprovedAndFinished(param: PageReq): Promise<[Array<any>, number]> {
        return createQueryBuilder("auction")
            .leftJoinAndSelect("Auction.creator", "user")
            .andWhere('is_approved = :is_approved', {
                is_approved: true
            })
            .andWhere('end_at => :end_at', {
                end_at: new Date()
            })
            .skip(param.getOffset())
            .take(param.getLimit())
            .getManyAndCount();
    }










}
