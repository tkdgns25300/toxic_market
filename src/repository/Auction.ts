import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { Auction } from "../entity";
import { BaseQueryRepo } from "./Base";
import { PageReq } from "../api";
import {AuctionSearchReq} from "../api/request/AuctionSearchReq";

@Service()
@EntityRepository(Auction)
export class AuctionQueryRepo extends BaseQueryRepo {
  constructor() {
    super("auction", "Auction");
  }

  findAllApproved(param: PageReq): Promise<[Array<any>, number]> {
    return createQueryBuilder("auction")
        .andWhere('is_approved = :is_approved', {
          is_approved: "O"
        })
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
        .andWhere('is_approved = :is_approved', {
          is_approved: "X"
        })
        .andWhere('start_at > :start_at', {
            start_at: new Date()
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
