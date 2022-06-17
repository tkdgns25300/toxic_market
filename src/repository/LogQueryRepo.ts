import { EntityRepository } from "typeorm";
import { Service } from "typedi";
import { Log } from "../entity";
import { BaseQueryRepo } from "./BaseQueryRepo";

@Service()
@EntityRepository(Log)
export class LogQueryRepo extends BaseQueryRepo {
  constructor() {
    super('log', 'Log');
  }
}
