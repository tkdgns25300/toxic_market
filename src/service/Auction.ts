import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { AuctionQueryRepo } from "../repository/Auction";
import {Auction, BidLog, User} from "../entity";
import {AuctionDto, BidDto} from "../dto";
import { PageReq, PageResList, PageResObj } from "../api";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import {UserQueryRepo} from "../repository/User";

@Service()
export class AuctionService {
  constructor(
    @InjectRepository()
    readonly auctionQueryRepo: AuctionQueryRepo,
    readonly userQueryRepo: UserQueryRepo,
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
    paramObj.creator_address = public_address
    let auction = await this.auctionQueryRepo.create(paramObj);

    const result: Auction = await this.auctionQueryRepo.findOne(
      "id",
      auction.identifiers[0].id
    );
    return new PageResObj(result, "판매자 등록에 성공했습니다.");
  }

  @Transaction()
  async bid(paramObj: BidDto,
            public_address: string,
            @TransactionManager() manager: EntityManager
  ): Promise<PageResObj<Auction | {}>> {

    let auction = await manager.findOne(Auction, paramObj.auction_id);
    const today = new Date()
    if (auction.start_at > today || auction.end_at < today) {
      return new PageResObj({}, "입찰 기간이 아닙니다.", true);
    }
    if (auction.bid >= paramObj.bid_amount) {
      return new PageResObj({}, "입찰가격이 기존 가격보다 높아야 합니다.", true);
    }
    if (auction.creator_address === public_address) {
      return new PageResObj({}, "경매를 생성하는 사람은 입찰할 수 없습니다.", true);
    }
    let newBidder = await manager.findOne(User, {public_address: public_address})

    if(newBidder.CF_balance < paramObj.bid_amount) {
      return new PageResObj({}, "잔액이 부족합니다.", true);
    }

    let oldBidder = await manager.findOne(User, {public_address: auction.bidder})
    if(oldBidder) {
      oldBidder.CF_balance += auction.bid;
      await manager.update(User, {public_address: oldBidder.public_address}, oldBidder);
    }
    newBidder.CF_balance -= paramObj.bid_amount;
    await manager.update(User, {public_address: newBidder.public_address}, newBidder);

    let bidLog = {
      bidder: public_address,
      bid: paramObj.bid_amount,
      auction_id: paramObj.auction_id
    }
    let bid = await manager.create(BidLog, bidLog);
    await manager.save(BidLog, bid)
    auction.bid = paramObj.bid_amount;
    auction.bidder = public_address;
    await manager.update(Auction,  auction.id, auction)

    const result: Auction = await manager.findOne(
        Auction,
        auction.id
    );
    return new PageResObj(result, "입찰하는데 성공했습니다.");
  }

  async confirm(paramObj: AuctionDto, id:number): Promise<PageResObj<Auction | {}>> {

    let auction = await this.auctionQueryRepo.findOne("id", id);
    auction.is_approved = paramObj.is_approved
    await this.auctionQueryRepo.update(auction,"id", id);
    return new PageResObj(auction, "경메 신청을 확인하는데 성공했습니다.");
  }

  @Transaction()
  async finish(paramObj: AuctionDto, id:number,
               @TransactionManager() manager: EntityManager): Promise<PageResObj<Auction | {}>> {

    let auction = await manager.findOne(Auction, id);
    if(auction.end_at > new Date()) {
      return new PageResObj({}, "경매는 아직 안 끝났습니다.", true);
    }

    if(paramObj.is_succeed === "O") {
      //send points to auction creator
      let creator = await manager.findOne(User, {public_address: auction.creator_address});
      creator.CF_balance += auction.bid;
      auction.is_succeed = "O";
      await manager.update(User, {public_address: creator.public_address}, creator);
      await manager.update(Auction, id, auction);
      return new PageResObj(paramObj, "포인트 지급하는데 성공했습니다.");
    }else {
      //send points back to bidder
      let bidder = await manager.findOne(User, {public_address: auction.bidder});
      bidder.CF_balance += auction.bid;
      auction.is_succeed = "X";
      await manager.update(User, {public_address: bidder.public_address}, bidder);
      await manager.update(Auction, id, auction);
      return new PageResObj(paramObj, "포인트 반송하는데 성공했습니다.");
    }

  }

}
