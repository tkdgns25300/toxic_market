import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageResObj } from "../api";
import { RaffleDto } from "../dto";
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
}