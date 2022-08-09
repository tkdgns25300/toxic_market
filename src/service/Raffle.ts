import { Service } from "typedi";
import { EntityManager, getManager, Transaction, TransactionManager } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageReq, PageResList, PageResObj } from "../api";
import { RaffleLogSearchReq } from "../api/request/RaffleLogSearchReq";
import { RaffleSearchReq } from "../api/request/RaffleSearchReq";
import { RaffleDto } from "../dto";
import { AgreeRaffleServiceDto, ApplyDto, RaffleConfirmDto, RaffleFinishDto } from "../dto/Raffle";
import { Raffle, RaffleLog, User } from "../entity";
import { UserSellerType } from "../enum";
import { RaffleQueryRepo } from "../repository/Raffle";
import { RaffleLogQueryRepo } from "../repository/RaffleLog";
import { UserQueryRepo } from "../repository/User";
import { selectWinner } from "../util/selectWinner";
import schedule from 'node-schedule';
import { dateToCron } from "../util/dateToCron";

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
    if (paramObj.price%10 !== 0) {
      return new PageResObj({}, "10TP단위로 입찰해주세요.", true);
    }
    const newRaffle = await this.raffleQueryRepo.create(paramObj);
    const result: Raffle = await this.raffleQueryRepo.findOne(
      "id",
      newRaffle.identifiers[0].id
    );
    // schedule 생성
    const endDate = new Date(result.end_at)
    const cronDate = dateToCron(endDate);
    schedule.scheduleJob('' + result.id, cronDate, async () => {
      // 응모자가 1명 이상인지 확인
      const currentRaffle: any = await this.raffleQueryRepo.getOne(result.id);
      if (currentRaffle.raffle_logs.length === 0) {
        return await this.raffleQueryRepo.update({ is_succeed: "X" } , "id", result.id);
      }
      // 이미 당첨자가 있는 경우 거르기
      if (currentRaffle.raffle_logs[0].is_winner === null) {
        // 당첨자 선정
        const winnerLogId = selectWinner(currentRaffle.raffle_logs)
        await this.raffleLogQueryRepo.selectWinner(result.id, winnerLogId);
      }
    })
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
    // 응모 가능한지 limit 확인
    const allRaffleLogs = await manager.findAndCount(RaffleLog, { raffle_id: paramObj.raffle_id });
    let currentRaffleAmount = 0
    allRaffleLogs[0].forEach(log => {
      currentRaffleAmount += log.amount
    })
    if (raffle.limit < currentRaffleAmount + paramObj.apply_amount) {
      return new PageResObj({}, "응모 제한 수량을 넘었습니다.", true);
    }
    // 30회를 초과하여 응모하는 지갑인지 확인
    let max = 30;
    const userRaffleLog = await manager.findOne(RaffleLog, { applicant: public_address, raffle_id: paramObj.raffle_id })
    if (userRaffleLog) max -= userRaffleLog.amount;
    if (paramObj.apply_amount > max) {
      return new PageResObj({}, "한 지갑당 30회만 응모 가능합니다.", true);
    }
    // 포인트 빼기 (잔액 확인)
    const applicant = await manager.findOne(User, public_address);
    if (applicant.CF_balance < raffle.price * paramObj.apply_amount) {
      return new PageResObj({}, "잔액이 부족합니다.", true);
    }
    applicant.CF_balance -= raffle.price * paramObj.apply_amount
    await manager.update(User, { public_address: applicant.public_address }, applicant);
    // 로그 생성: 이미 응모한 기록이 있는 경우 amount만 업데이트
    const oldRaffleLog = await manager.findOne(RaffleLog, {applicant: public_address, raffle_id: paramObj.raffle_id})
    if (oldRaffleLog) {
      oldRaffleLog.amount += paramObj.apply_amount;
      await manager.update(RaffleLog, { id: oldRaffleLog.id }, oldRaffleLog)
    }
    else {
      const raffleLog = {
        applicant: applicant.public_address,
        amount: paramObj.apply_amount,
        raffle_id: paramObj.raffle_id
      }
      await manager.save(RaffleLog, raffleLog);
    }
    const result: Raffle = await manager.findOne(Raffle, raffle.id);
    return new PageResObj(result, "응모에 성공했습니다.");
  }

  async getOne(id: number, is_admin: boolean): Promise<PageResObj<Raffle | {}>> {
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
    if (raffle.is_succeed === 'O') {
      return new PageResObj({}, "이미 종료된 응모입니다.", true);
    }
    // 응모자가 1명 이상인지 확인
    if (raffle.raffle_logs.length === 0) {
      // 자동으로 응모실패 처리
      await this.raffleQueryRepo.update({ is_succeed: "X" } , "id", raffle_id);
      return new PageResObj({}, "응모자 0명으로 응모실패 처리하였습니다.", true);
    }
    if (raffle.raffle_logs[0].is_winner !== null) {
      return new PageResObj({}, "이미 당첨자를 선정한 응모입니다.", true);
    }
    // 당첨자 선정
    const winnerLogId = selectWinner(raffle.raffle_logs)
    await this.raffleLogQueryRepo.selectWinner(raffle_id, winnerLogId);
    const result = await this.raffleQueryRepo.getOne(raffle_id);
    return new PageResObj(result, "당첨자 선정에 성공하였습니다.");
  }

  async findRaffleLogs(paramObj: RaffleLogSearchReq): Promise<PageResList<Raffle | {}>> {
    if (
      (paramObj.buyer === undefined && paramObj.seller === undefined) ||
      (paramObj.buyer !== undefined && paramObj.seller !== undefined)
    ) {
      return new PageResList(0, 0, [], "buyer와 seller중 한 가지만 입력해주세요.", true)
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

  async findUserRaffles(param: PageReq, creator_address: string): Promise<PageResList<Raffle>> {
    const result = await this.raffleQueryRepo.findUserRaffles(param, creator_address);
    return new PageResList<Raffle>(
      result[1],
      param.limit,
      result[0].map((el: Raffle) => {
        return el;
      }),
      "Raffle 목록을 찾는데 성공했습니다."
    );
  }

  @Transaction()
  async finish(paramObj: RaffleFinishDto, id:number, @TransactionManager() manager: EntityManager): Promise<PageResObj<{}>> {
    let raffle = await manager.query('select * from raffle where id = ?', [id])
    raffle = raffle[0]
    // 응모가 종료되어야 finish 가능
    if (raffle.end_at >= new Date()) {
      return new PageResObj({}, "응모기간이 끝나지 않았습니다.", true);
    }
    // 거래 완료
    if (paramObj.is_succeed === "O") {
      // 포인트 지급 및 추첨 is_succeed = 'O' 처리
      const creator = await manager.findOne(User, { public_address: raffle.creator_address })
      const raffleLog = await manager.find(RaffleLog, { raffle_id: raffle.id })
      let totalPoint = 0;
      raffleLog.forEach(log => totalPoint += raffle.price * log.amount);
      creator.CF_balance += totalPoint;
      raffle.is_succeed = "O";
      await manager.update(User, {public_address: raffle.creator_address}, creator);
      delete raffle.creator_address
      await manager.update(Raffle, id, raffle);
      return new PageResObj({}, "포인트 지급에 성공했습니다.");
    }
    // 응모 실패
    else {
      // 포인트 반송 및 추첨 is_succeed = 'X' 처리
      const raffleLog = await manager.find(RaffleLog, { raffle_id: raffle.id })
      for (let log of raffleLog) {
        let applicant = await manager.findOne(User, { public_address: log.applicant })
        applicant.CF_balance += raffle.price * log.amount
        await manager.update(User, {public_address: log.applicant}, applicant);
      }
      raffle.is_succeed = "X";
      delete raffle.creator_address;
      await manager.update(Raffle, id, raffle);
      return new PageResObj({}, "포인트 반송에 성공했습니다.");
    }
  }

  async update(paramObj: RaffleDto, id: number): Promise<PageResObj<Raffle | {}>> {
    const raffle: any = await this.raffleQueryRepo.getOne(id);
    if (raffle.creator.public_address.toLowerCase() !== paramObj.creator.toLowerCase()) {
      return new PageResObj({}, "추첨을 생성한 사용자만 수정 가능합니다.", true);
    }
    const user = await this.userQueryRepo.findOne("public_address", paramObj.creator)
    // 마감시간 이후 마감시간은 수정 불가
    if (raffle.end_at <= new Date()) {
      delete paramObj?.end_at
    }
    if (user.seller_type === UserSellerType.INDIVIDUAL) {
      delete paramObj?.price
      delete paramObj?.title
      delete paramObj?.end_at
      delete paramObj?.start_at
      delete paramObj?.limit
    }
    delete paramObj.creator;
    await this.raffleQueryRepo.update(paramObj, "id", id);
    // 마감시간 수정 시 schedule 수정
    if (paramObj.end_at !== undefined) {
      // schedule 삭제
      const myJob = schedule.scheduledJobs['' + raffle.id]
      if (myJob) {
        myJob.cancel();
      } 
      // schedule 생성
      const cronDate = dateToCron(paramObj.end_at);
      schedule.scheduleJob('' + raffle.id, cronDate, async () => {
        const currentRaffle: any = await this.raffleQueryRepo.getOne(raffle.id);
        // 응모자가 1명 이상인지 확인
        if (currentRaffle.raffle_logs.length === 0) {
          return await this.raffleQueryRepo.update({ is_succeed: "X" } , "id", id);
        }
        // 이미 당첨자가 있는 경우 거르기
        if (currentRaffle.raffle_logs[0].is_winner === null) {
          // 당첨자 선정
          const winnerLogId = selectWinner(currentRaffle.raffle_logs)
          await this.raffleLogQueryRepo.selectWinner(id, winnerLogId);
        }
      })
    }
    return new PageResObj({}, "추첨 수정에 성공했습니다.");
  }
  
  async agree(paramObj: AgreeRaffleServiceDto, public_address: string): Promise<PageResObj<{}>> {
    if (paramObj.agreeRaffleService === 'X') {
      return new PageResObj({}, "약관에 동의해주세요.", true);
    }
    else if (paramObj.agreeRaffleService === 'O') {
      await this.userQueryRepo.update(paramObj, "public_address", public_address);
      return new PageResObj({}, "약관에 동의하였습니다.");
    }
  }
}