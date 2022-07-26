import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageReq, PageResList, PageResObj } from "../api";
import { RaffleSearchReq } from "../api/request/RaffleSearchReq";
import { RaffleDto } from "../dto";
import { RaffleConfirmDto } from "../dto/Raffle";
import { Raffle, User } from "../entity";
import { RaffleQueryRepo } from "../repository/Raffle";
import { UserQueryRepo } from "../repository/User";

@Service()
export class RaffleService {
  constructor(
    @InjectRepository()
    readonly raffleQueryRepo: RaffleQueryRepo,
    readonly userQueryRepo: UserQueryRepo
  ) {}

  async create(paramObj: RaffleDto): Promise<PageResObj<Raffle | {}>> {
    const user: User = await this.userQueryRepo.findOne("public_address", paramObj.creator_address);
    if (user.is_seller !== 'O') {
      return new PageResObj({}, "판매자 권한이 없습니다.", true);
    }
    const newRaffle = await this.raffleQueryRepo.create(paramObj);
    const result: Raffle = await this.raffleQueryRepo.findOne(
      "id",
      newRaffle.identifiers[0].id
    );
    return new PageResObj(result, "추첨 생성에 성공했습니다.")
  }

  async confirm(paramObj: RaffleConfirmDto, id: number): Promise<PageResObj<Raffle | {}>> {
    if (Object.keys(paramObj).length === 0 || paramObj.is_approved === 'X') {
      await this.raffleQueryRepo.delete("id", id);
      return new PageResObj({}, "추첨 등록을 거부했습니다.");
    }
    let raffle = await this.raffleQueryRepo.findOne("id", id);
    raffle.is_approved = paramObj.is_approved;
    await this.raffleQueryRepo.update(raffle, "id", id);
    return new PageResObj(raffle, "추첨 등록을 승인했습니다.")
  }

  async findAllNotApproved(paramObj: RaffleSearchReq): Promise<PageResList<Raffle>> {
    const result = await this.raffleQueryRepo.findAllNotApproved(paramObj);
    return new PageResList<Raffle> (
        result[1],
        paramObj.limit,
        result[0].map((el: Raffle) => {
          return el;
        }),
        "Raffle 목록을 찾는데 성공했습니다."
    );
  }

  async findAllApprovedAndNotFinished(paramObj: RaffleSearchReq): Promise<PageResList<Raffle>> {
    const result = await this.raffleQueryRepo.getAllApprovedAndNotFinished(paramObj);
    return new PageResList<Raffle> (
        result[1],
        paramObj.limit,
        result[0].map((el: Raffle) => {
          return el;
        }),
        "Raffle 목록을 찾는데 성공했습니다."
    );
  }
  
  async findAllApprovedAndFinished(paramObj: RaffleSearchReq): Promise<PageResList<Raffle>> {
    const result = await this.raffleQueryRepo.getAllApprovedAndFinished(paramObj);
    return new PageResList<Raffle> (
        result[1],
        paramObj.limit,
        result[0].map((el: Raffle) => {
          return el;
        }),
        "Raffle 목록을 찾는데 성공했습니다."
    );
  }

  async findAllApproved(paramObj: PageReq): Promise<PageResList<Raffle>> {
    const result = await this.raffleQueryRepo.findAllApproved(paramObj);
    return new PageResList<Raffle> (
        result[1],
        paramObj.limit,
        result[0].map((el: Raffle) => {
          return el;
        }),
        "Raffle 목록을 찾는데 성공했습니다."
    );
  }

}