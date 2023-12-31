import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserQueryRepo } from "../repository/User";
import { User } from "../entity";
import { UserDto } from "../dto";
import { PageReq, PageResList, PageResObj, UserSearchReq} from "../api";
import { UserIdPasswordDto, UserPasswordDto, UserProfileDto } from "../dto/User";
import { hash } from "../util/hash";
import { LogQueryRepo } from "../repository/Log";
import { RaffleLogQueryRepo } from "../repository/RaffleLog";
import { BidLogQueryRepo } from "../repository/BIdLog";

@Service()
export class UserService {
  constructor(
    @InjectRepository()
    readonly userQueryRepo: UserQueryRepo,
    readonly logQueryRepo: LogQueryRepo,
    readonly raffleLogQueryRepo: RaffleLogQueryRepo,
    readonly bidLogQueryRepo: BidLogQueryRepo
  ) {}

  async findAll(param: UserSearchReq): Promise<PageResList<User>> {
    const result = await this.userQueryRepo.search(param);
    return new PageResList<User>(
      result[1],
      param.limit,
      result[0].map((el: User) => {
        delete el.password_hash;
        delete el.nonce;
        return el;
      }),
      "User 목록을 찾는데 성공했습니다."
    );
  }
  
  async findAllSeller(param: UserSearchReq): Promise<PageResList<User>> {
    const result = await this.userQueryRepo.searchSeller(param);
    return new PageResList<User>(
      result[1],
      param.limit,
      result[0].map((el: User) => {
        delete el.password_hash;
        delete el.nonce;
        return el;
      }),
      "User 목록을 찾는데 성공했습니다."
    );
  }

  async findOne(public_address: string): Promise<PageResObj<User | {}>> {
    const result = await this.userQueryRepo.findOne("public_address", public_address);
    delete result.password_hash;
    delete result.nonce;
    return new PageResObj(result, "User 조회에 성공했습니다.");
  }

  async create(paramObj: UserDto): Promise<PageResObj<User | {}>> {
    let user = await this.userQueryRepo.findOne("public_address", paramObj.public_address)
    if (paramObj.store_name === '') {
      delete paramObj.store_name
    }
    if(user){
      await this.userQueryRepo.update(paramObj, "public_address", paramObj.public_address)
      return new PageResObj(paramObj, "판매자 등록에 성공했습니다.");
    }
    paramObj.nonce = String(Math.floor(Math.random() * 1000000));
    user = await this.userQueryRepo.create(paramObj);
    const result: User = await this.userQueryRepo.findOne(
      "public_address",
      user.identifiers[0].public_address
    );
    return new PageResObj(result, "판매자 등록에 성공했습니다.");
  }

  async register(paramObj: UserIdPasswordDto, public_address: string): Promise<PageResObj<{}>> {
    const isExist = await this.userQueryRepo.findOne("id", paramObj.id)
    if (isExist) {
      return new PageResObj({}, "존재하는 ID입니다.", true);
    }
    const user = await this.userQueryRepo.findOne("public_address", public_address)
    // 이미 ID를 등록했었던 경우
    if (user.id !== null) {
      return new PageResObj({}, "이미 ID가 등록되어 있습니다.", true);
    }
    // ID 등록
    const updatedUser = await this.userQueryRepo.update({
      id: paramObj.id,
      password_hash: hash(paramObj.password)      
    }, "public_address", public_address)
    if (updatedUser.affected !== 1) {
      return new PageResObj({}, "ID등록에 실패하였습니다.", true);
    }
    return new PageResObj({}, "ID등록에 성공하였습니다.");
  }

  async updatePassword(paramObj: UserPasswordDto, public_address: string): Promise<PageResObj<{}>> {
    if (paramObj?.password === undefined) {
      return new PageResObj({}, "변경할 비밀번호을 입력해주세요.", true);  
    }
    await this.userQueryRepo.update({ password_hash: hash(paramObj.password) }, "public_address", public_address);
    return new PageResObj({}, "비밀번호 변경에 성공했습니다.");
  }

  async updateProfile(paramObj: UserProfileDto, public_address: string): Promise<PageResObj<User | {}>> {
    const update = await this.userQueryRepo.update(paramObj, "public_address", public_address);
    if (update.affected === 0) {
      return new PageResObj({}, "프로필 수정에 실패했습니다.", true);
    }
    const result = await this.userQueryRepo.findOne("public_address", public_address);
    delete result.nonce;
    delete result.password_hash;
    return new PageResObj(result, "프로필 수정에 성공했습니다.");
  }

  async delete(public_address: string): Promise<PageResObj<{}>> {
    const result = await this.userQueryRepo.delete("public_address", public_address);
    if(result.affected !== 1) {
      return new PageResObj({}, "회원탈퇴에 실패하였습니다.", true);
    }
    return new PageResObj({}, "회원탈퇴에 성공하였습니다.");
  }

  async updateSeller(public_address: string, paramObj: UserDto): Promise<PageResObj<User | {}>> {
    const update = await this.userQueryRepo.update(paramObj, 'public_address', public_address);
    if (update.affected === 0) {
      return new PageResObj({}, "판매자 수정에 실패했습니다.", true);
    };

    const result: User = await this.userQueryRepo.findOne(
      "public_address",
      paramObj.public_address
    );
    return new PageResObj(result, "판매자 수정에 성공했습니다.");
  }

  async getAllLog(public_address: string): Promise<PageResObj<{}>> {
    // Product Log
    const productBuyLog = await this.logQueryRepo.findBuyProductLogs(public_address)
    const productSellLog = await this.logQueryRepo.findSellProductLogs(public_address)

    // Auction Log
    const auctionBuyLog = await this.bidLogQueryRepo.findBuyBidLogs(public_address)
    const auctionSellLog = await this.bidLogQueryRepo.findSellBidLogs(public_address)

    // Raffle Log
    const raffleBuyLog = await this.raffleLogQueryRepo.findBuyRaffleLogs(public_address)
    const raffleSellLog = await this.raffleLogQueryRepo.findSellRaffleLogs(public_address)

    // 모든 Log 정렬
    const buyLog = [];
    productBuyLog[0].forEach(log => buyLog.push({
      category: '마켓',
      title: log.title,
      total_point: log.total_CF,
      created_at: log.created_at
    }))
    auctionBuyLog[0].forEach(log => buyLog.push({
      category: '경매',
      title: log.auction_id.title,
      total_point: log.bid,
      created_at: log.created_at
    }))
    raffleBuyLog[0].forEach(log => buyLog.push({
      category: '추첨',
      title: log.raffle_id.title,
      total_point: log.amount * log.raffle_id.price,
      created_at: log.created_at
    }))
    const buy_log = buyLog.sort((a, b) => b.created_at - a.created_at)

    const sellLog = [];
    productSellLog[0].forEach(log => sellLog.push({
      category: '마켓',
      title: log.title,
      total_point: log.total_CF,
      created_at: log.created_at
    }))
    auctionSellLog[0].forEach(log => sellLog.push({
      category: '경매',
      title: log.auction_id.title,
      total_point: log.bid,
      created_at: log.created_at
    }))
    raffleSellLog[0].forEach(log => sellLog.push({
      category: '추첨',
      title: log.raffle_id.title,
      total_point: log.amount * log.raffle_id.price,
      created_at: log.created_at
    }))
    const sell_log = sellLog.sort((a, b) => b.created_at - a.created_at)

    return new PageResObj({ buy_log, sell_log }, "유저의 구매/판매 내역 조회에 성공하였습니다.");
  }
}
