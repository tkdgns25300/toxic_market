import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { EntityManager, Transaction, TransactionManager } from "typeorm";

import { AuctionQueryRepo } from "../repository/Auction";
import {Auction, BidLog, Product, User} from "../entity";
import {AuctionDto, BidDto} from "../dto";
import { PageReq, PageResList, PageResObj } from "../api";
import {UserQueryRepo} from "../repository/User";
import {AuctionSearchReq} from "../api/request/AuctionSearchReq";
import {UserSellerType} from "../enum";

@Service()
export class AuctionService {
  constructor(
    @InjectRepository()
    readonly auctionQueryRepo: AuctionQueryRepo,
    readonly userQueryRepo: UserQueryRepo,
  ) {}
  async getNewest(): Promise<PageResObj<Auction | {}>> {

    const result = await this.auctionQueryRepo.getNewest( );
    // result.bid_logs에 닉네임, 프로필 이미지 추가하여 리턴 : 좋지 않은 방식 => but 프로젝트 크기가 크지 않아 속도 저하의 우려가 없어 이렇게 작성.
    const newBidLog = []
    for (const el of result.bid_logs) {
      const bidder = await this.userQueryRepo.findOne("public_address", el.bidder);
      el.nickname = bidder.nickname;
      el.profile_img = bidder.profile_img;
      newBidLog.push(el)
    }
    result.bid_logs = newBidLog;
    result?.bid_logs?.map(a => {
      a.bidder = `${a.bidder.slice(0,3)}******${a.bidder.slice(-3)}`
    })
    result?.bid_logs?.reverse();

    return new PageResObj(result, "Auction 조회에 성공했습니다.");
  }


  async findAllApprovedAndFinished(param: AuctionSearchReq): Promise<PageResList<Auction>> {
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

  async findAllApprovedAndNotFinished(param: AuctionSearchReq): Promise<PageResList<Auction>> {
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
    // nickname, profile_img추가 하여 리턴 : 좋지 않은 방식 => but 프로젝트 크기가 크지 않아 속도 저하의 우려가 없어 이렇게 작성.
    for (const el of result[0]) {
      const creator = await this.userQueryRepo.findOne("public_address", creator_address);
      el.nickname = creator.nickname;
      el.profile_img = creator.profile_img;
      delete el.creator
    }
    return new PageResList<Auction>(
        result[1],
        param.limit,
        result[0].map((el: Auction) => {
          return el;
        }),
        "Auction 목록을 찾는데 성공했습니다."
    );
  }


  async findBidLogs(param: PageReq, creator_address: string): Promise<PageResList<BidLog>> {
    const result = await this.auctionQueryRepo.getBidLogs(param, creator_address);
    let auctions = {}
    let filtered = result[0].map((el: BidLog) => {

      // @ts-ignore
      if(auctions[`${el.auction_id.id}`]){
        return null
      }
      // @ts-ignore
      auctions[`${el.auction_id.id}`] = el.auction_id.id;
      return el;
    })

    return new PageResList<BidLog>(
        result[1],
        param.limit,
        filtered.filter((el: BidLog) => (el !== null)),
        "Auction 목록을 찾는데 성공했습니다."
    );
  }


  async findOne(id: number, withUser: boolean): Promise<PageResObj<Auction | {}>> {
    let joinTable = [{property: "Auction.bid_logs", alias: "bid_log"}]
    if(withUser) { //Available for managers
      joinTable.push({property: "Auction.creator", alias: "user"})
    }
    const result = await this.auctionQueryRepo.findOne("id", id, joinTable);
    // result.bid_logs에 닉네임, 프로필 이미지 추가하여 리턴 : 좋지 않은 방식 => but 프로젝트 크기가 크지 않아 속도 저하의 우려가 없어 이렇게 작성.
    const newBidLog = []
    for (const el of result.bid_logs) {
      const bidder = await this.userQueryRepo.findOne("public_address", el.bidder);
      el.nickname = bidder.nickname;
      el.profile_img = bidder.profile_img;
      newBidLog.push(el)
    }
    result.bid_logs = newBidLog;
    if(withUser) delete result.creator.password_hash;
    if(!withUser) {
      result.bid_logs.map(a => {
        a.bidder = `${a.bidder.slice(0,3)}******${a.bidder.slice(-3)}`
      })
    }
    result.bid_logs.reverse();
    return new PageResObj(result, "Auction 조회에 성공했습니다.");
  }

  async findAllNotApproved(param: AuctionSearchReq): Promise<PageResList<Auction>> {
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
    // nickname, profile_img추가 하여 리턴 : 좋지 않은 방식 => 프로젝트 크기가 크지 않아 속도 저하의 우려가 없어 이렇게 작성.
    for (const el of result[0]) {
      const creator = await this.userQueryRepo.findOne("public_address", el.creator_address);
      el.nickname = creator.nickname;
      el.profile_img = creator.profile_img;
    }
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
    if (auction.creator_address === public_address) {
      return new PageResObj({}, "경매를 생성하는 사람은 입찰할 수 없습니다.", true);
    }
    if (auction.bid >= paramObj.bid_amount) {
      return new PageResObj({}, "입찰가격이 기존 가격보다 높아야 합니다.", true);
    }
    if (paramObj.bid_amount%100 !== 0) {
      return new PageResObj({}, "100TP단위로 입찰해주세요.", true);
    }
    let newBidder = await manager.findOne(User, {public_address: public_address})
    if(public_address === auction.bidder) {
      paramObj.bid_amount -= auction.bid
    }
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
    if(public_address === auction.bidder) {
      paramObj.bid_amount += auction.bid
    }
    let bidLog = {
      bidder: public_address,
      bid: paramObj.bid_amount,
      auction_id: paramObj.auction_id
    }
    let bid = await manager.create(BidLog, bidLog);
    await manager.save(BidLog, bid)
    auction.bid = paramObj.bid_amount;
    auction.bidder = public_address;
    let date = new Date().getTime() //+ 32400000; // TODO: remove +32400000 (9hours) when dates are synchronized
    let end = new Date(auction.end_at).getTime() //TODO: check the difference between sql server and server
   let seconds = end - date;
    if(seconds < 60000 && seconds > 0) {
      auction.end_at = new Date(end + 60000 - seconds)  // add one minute
    }

    await manager.update(Auction,  auction.id, auction)

    const result: Auction = await manager.findOne(
        Auction,
        auction.id
    );
    return new PageResObj(result, "입찰하는데 성공했습니다.");
  }


  async confirm(paramObj: AuctionDto, id:number): Promise<PageResObj<Auction | {}>> {
    if(!paramObj.is_approved){
      await this.auctionQueryRepo.delete("id",id)
      return new PageResObj({}, "경메 신청을 거부하는데 성공했습니다.");
    }
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

  async update(paramObj: AuctionDto, id: number): Promise<PageResObj<Product | {}>> {

    let product = await this.auctionQueryRepo.findOne("id", id);
    if(product.creator_address.toLowerCase() !== paramObj.creator_address.toLowerCase()) {
      return new PageResObj({}, "상품을 생성한 사용자만 수정 가능합니다.", true);
    }
    let user = await this.userQueryRepo.findOne("public_address", paramObj.creator_address)
    // 마감시간 이후 마감시간은 수정 불가
    if (product.end_at <= new Date()) {
      delete paramObj?.end_at
    }
    if(user.seller_type === UserSellerType.INDIVIDUAL) {
      delete paramObj?.price
      delete paramObj?.start_at
      delete paramObj?.end_at
      delete paramObj?.title
    }
    // start_at, end_at 수정
    if (paramObj.start_at === null || paramObj.end_at === null) {
      return new PageResObj({}, "유효한 날짜값을 입력해주세요.", true);
    }

    await this.auctionQueryRepo.update(paramObj,"id", id);
    return new PageResObj({}, "경매 수정에 성공했습니다.");
  }
}
