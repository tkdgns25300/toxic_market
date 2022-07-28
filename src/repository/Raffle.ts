import { Service } from "typedi";
import { EntityRepository } from "typeorm";
import { Raffle } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(Raffle)
export class RaffleQueryRepo extends BaseQueryRepo {
  constructor() {
    super("raffle", "Raffle")
  }
}