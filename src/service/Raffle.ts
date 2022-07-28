import { Service } from "typedi";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageReq, PageResList, PageResObj } from "../api";
import { RaffleLogSearchReq } from "../api/request/RaffleLogSearchReq";
import { RaffleSearchReq } from "../api/request/RaffleSearchReq";
import { RaffleDto } from "../dto";
import { ApplyDto, RaffleConfirmDto } from "../dto/Raffle";
import { Raffle, RaffleLog, User } from "../entity";
import { RaffleQueryRepo } from "../repository/Raffle";
import { RaffleLogQueryRepo } from "../repository/RaffleLog";
import { UserQueryRepo } from "../repository/User";

@Service()
export class RaffleService {
  constructor(
    @InjectRepository()
    readonly raffleQueryRepo: RaffleQueryRepo,
    readonly userQueryRepo: UserQueryRepo,
    readonly raffleLogQueryRepo: RaffleLogQueryRepo
  ) {}

  async create(paramObj: RaffleDto): Promise<PageResObj<Raffle | {}>> {
    const user: User = await this.userQueryRepo.findOne("public_address", paramObj.creator);
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

  @Transaction()
  async apply(paramObj: ApplyDto, public_address: string, @TransactionManager() manager: EntityManager): Promise<PageResObj<Raffle | {}>> {
    let raffle = await manager.query('select * from raffle where id = ?', [paramObj.raffle_id])
    raffle = raffle[0]
    // 추첨 기간에만 응모가능
    const today = new Date();
    if (raffle.start_at > today || raffle.end_at < today) {
      return new PageResObj({}, "추첨 기간이 아닙니다.", true);
    }
    // 추첨 생성자는 입찰 불가
    if (raffle.creator_address === public_address) {
      return new PageResObj({}, "추첨 생성자는 참가할 수 없습니다.", true);
    }
    // 포인트 빼기 (잔액 확인)
    const applicant = await manager.findOne(User, public_address);
    if (applicant.CF_balance < raffle.price * paramObj.apply_amount) {
      return new PageResObj({}, "잔액이 부족합니다.", true);
    }
    applicant.CF_balance -= raffle.price * paramObj.apply_amount
    await manager.update(User, { public_address: applicant.public_address }, applicant);
    // 로그 생성
    const raffleLog = {
      applicant: applicant.public_address,
      amount: paramObj.apply_amount,
      raffle_id: paramObj.raffle_id
    }
    await manager.save(RaffleLog, raffleLog);
    const result: Raffle = await manager.findOne(Raffle, raffle.id);
    return new PageResObj(result, "응모에 성공했습니다.");
  }

  async getOne(id: number, is_admin: boolean): Promise<PageResObj<any | {}>> {
    const result: any = await this.raffleQueryRepo.getOne(id)
    // 관리자가 아닌 경우 응모자 지갑 별표처리
    if (!is_admin) {
      result.raffle_logs.map(r => {
        r.applicant = `${r.applicant.slice(0,3)}******${r.applicant.slice(-3)}`
      })
    }
    return new PageResObj(result, "Raffle 조회에 성공했습니다.");
  }

  async selectWinner(raffle_id: number): Promise<PageResObj<Raffle | {}>> {
    // 끝난 응모인지 확인
    const raffle: any = await this.raffleQueryRepo.getOne(raffle_id);
    if (raffle.end_at >= new Date()) {
      return new PageResObj({}, "아직 응모기간이 종료되지 않았습니다.", true);  
    }
    // 응모자가 1명 이상인지 확인
    if (raffle.raffle_logs.length === 0) {
      // 자동으로 응모실패 처리
      await this.raffleQueryRepo.update({ is_succeed: "X" } , "id", raffle_id);
      return new PageResObj({}, "응모자 0명으로 응모실패 처리하였습니다.", true);  
    }
    // 당첨자 선정
    const ranNum = Math.floor(Math.random() * raffle.raffle_logs.length);
    const winnerLogId = raffle.raffle_logs[ranNum].id;
    await this.raffleLogQueryRepo.selectWinner(raffle_id, winnerLogId);
    const result = await this.raffleQueryRepo.getOne(raffle_id);
    return new PageResObj(result, "당첨자 선정에 성공하였습니다.");
  }

  // async findRaffleLogs(paramObj: RaffleLogSearchReq): Promise<PageResList<any>> {
  async findRaffleLogs(paramObj: RaffleLogSearchReq) {
    if (
      (paramObj.buyer === undefined && paramObj.seller === undefined) ||
      (paramObj.buyer !== undefined && paramObj.seller !== undefined)
    ) {
      return new PageResObj({}, "buyer와 seller중 한 가지만 입력해주세요.", true);  
    }
    const result = await this.raffleQueryRepo.getRaffleLogs(paramObj);
    return new PageResList<any>(
      result[1],
      paramObj.limit,
      result[0].map((el: Raffle) => {
        return el;
      }),
      "Raffle Log 목록을 찾는데 성공했습니다."
    );
  }
}