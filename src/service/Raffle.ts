import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageResObj } from "../api";
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
}