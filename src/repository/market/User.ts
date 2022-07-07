import { EntityRepository } from "typeorm";
import { Service } from "typedi";
import { User } from "../../entity/market";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(User)
export class UserQueryRepo extends BaseQueryRepo {
  constructor() {
    super("user", "User");
  }
}
