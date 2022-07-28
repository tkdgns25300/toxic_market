import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { RaffleLog } from "../entity";
import { BaseQueryRepo } from "./Base";

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
}
