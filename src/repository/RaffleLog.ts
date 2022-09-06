import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { RaffleLog } from "../entity";
import { BaseQueryRepo } from "./Base";
import { PageReq } from "../api";

@Service()
@EntityRepository(RaffleLog)
export class RaffleLogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("raffle_log", "RaffleLog");
  }

  async selectWinner(raffle_id: number, raffleLog_id: number) {
    const builder = createQueryBuilder("raffle_log");

    await builder
    .update("raffle_log")
    .set({ is_winner: 'X' })
    .where("raffle_id = :raffle_id", { raffle_id: raffle_id})
    .execute()

    await builder
    .update("raffle_log")
    .set({ is_winner: 'O' })
    .where("id = :raffleLog_id", { raffleLog_id: raffleLog_id})
    .execute()
  }

  findBuyRaffleLogs(param: PageReq, public_address: string): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle_log");

    builder
    .leftJoinAndSelect("RaffleLog.raffle_id", "raffle")
    .where(`RaffleLog.applicant = :public_address`, {
      public_address: public_address,
    })
    .orderBy('RaffleLog.created_at', 'DESC')

    return builder.getManyAndCount();
  }

  findSellRaffleLogs(param: PageReq, public_address: string): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle_log");

    builder
    .leftJoinAndSelect("RaffleLog.raffle_id", "raffle")
    .where(`raffle.creator_address = :public_address`, {
      public_address: public_address,
    })
    .orderBy('RaffleLog.created_at', 'DESC')

    return builder.getManyAndCount();
  }
}
