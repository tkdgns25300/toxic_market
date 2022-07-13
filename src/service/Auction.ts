import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { AuctionQueryRepo } from "../repository/Auction";
import { Auction } from "../entity";
import {AuctionDto, BidDto} from "../dto";
import { PageReq, PageResList, PageResObj } from "../api";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import {UserQueryRepo} from "../repository/User";
import {BidLogQueryRepo} from "../repository/BIdLog";

@Service()
export class AuctionService {
  constructor(
    @InjectRepository()
    readonly auctionQueryRepo: AuctionQueryRepo,
    readonly userQueryRepo: UserQueryRepo,
    readonly bidLogQueryRepo: BidLogQueryRepo
  ) {}

  async findAllApprovedAndFinished(param: PageReq): Promise<PageResList<Auction>> {
    const result = await this.auctionQueryRepo.getAllApprovedAndFinished(param);
    return new PageResList<Auction>(
        result[1],
        param.limit,
        result[0].map((el: Auction) => {
          return el;
        }),
        "Auction 목록을 찾는데 성공했습니다."
    );
  }

  async findAllApprovedAndNotFinished(param: PageReq): Promise<PageResList<Auction>> {
    const result = await this.auctionQueryRepo.getAllApprovedAndNotFinished(param);
    return new PageResList<Auction>(
        result[1],
        param.limit,
        result[0].map((el: Auction) => {
          return el;
        }),
        "Auction 목록을 찾는데 성공했습니다."
    );
  }

  async findUserAuctions(param: PageReq, creator_address: string): Promise<PageResList<Auction>> {
    const result = await this.auctionQueryRepo.findUserAuctions(param, creator_address);
    return new PageResList<Auction>(
        result[1],
        param.limit,
        result[0].map((el: Auction) => {
          return el;
        }),
        "Auction 목록을 찾는데 성공했습니다."
    );
  }

  async findOne(id: number, withUser: boolean): Promise<PageResObj<Auction | {}>> {
    let joinTable = [{property: "Auction.bid_logs", alias: "bid_log"}]
    if(withUser) { //Available for managers
      joinTable.push({property: "Auction.creator", alias: "user"})
    }
    const result = await this.auctionQueryRepo.findOne("id", id, joinTable);
    return new PageResObj(result, "Auction 조회에 성공했습니다.");
  }

  async findAllNotApproved(param: PageReq): Promise<PageResList<Auction>> {
    const result = await this.auctionQueryRepo.findAllNotApproved(param);
    return new PageResList<Auction>(
        result[1],
        param.limit,
        result[0].map((el: Auction) => {
          return el;
        }),
        "Auction 목록을 찾는데 성공했습니다."
    );
  }

  async findAllApproved(param: PageReq): Promise<PageResList<Auction>> {
    const result = await this.auctionQueryRepo.findAllApproved(param);
    return new PageResList<Auction>(
        result[1],
        param.limit,
        result[0].map((el: Auction) => {
          return el;
        }),
        "Auction 목록을 찾는데 성공했습니다."
    );
  }

  async create(paramObj: AuctionDto, public_address: string): Promise<PageResObj<Auction | {}>> {

    let user = await this.userQueryRepo.findOne("public_address", public_address)
    if(user.is_seller !== "O") {
      return new PageResObj({}, "판매자가 권한이 없습니다.", true);
    }
    let auction = await this.auctionQueryRepo.create(paramObj);

    const result: Auction = await this.auctionQueryRepo.findOne(
      "id",
      auction.identifiers[0].id
    );
    return new PageResObj(result, "판매자 등록에 성공했습니다.");
  }

  async bid(paramObj:BidDto, public_address: string): Promise<PageResObj<Auction | {}>> {

    let auction = await this.auctionQueryRepo.findOne("id", paramObj.auction_id);
    const today = new Date()
    if(auction.start_at > today || auction.end_at < today) {
      return new PageResObj({}, "입찰 기간이 아닙니다.", true);
    }
    if(auction.bid >= paramObj.bid_amount) {
      return new PageResObj({}, "입찰가격이 기존 가격보다 높아야 합니다.", true);
    }
    if(auction.creator === public_address) {
      return new PageResObj({}, "겸매를 생성하는 사람은 입찰할 수 없습니다.", true);
    }

    let bidLog = {
      bidder: public_address,
      bid: paramObj.bid_amount,
      auction_id: paramObj.auction_id
    }

    await this.bidLogQueryRepo.create(bidLog);
    auction.bid = paramObj.bid_amount;
    auction.bidder = public_address;
    await this.auctionQueryRepo.update(auction, "id", auction.id)

    const result: Auction = await this.auctionQueryRepo.findOne(
        "id",
        auction.id
    );
    return new PageResObj(result, "입찰하는데 성공했습니다.");

  }

  async update(paramObj: AuctionDto, id:number): Promise<PageResObj<Auction | {}>> {
    // ONLY is_succeed and is_approved properties can be updated
    let keys = Object.keys(paramObj);
    for(let i = 0; i < keys.length; i++) {
      if(keys[i]!== "is_succeed" || keys[i]!== "is_approved") {
        delete paramObj[keys[i]];
      }
    }
    await this.auctionQueryRepo.update(paramObj,"id", id);

    return new PageResObj(paramObj, "판매자 등록에 성공했습니다.");
  }


}
