import {createQueryBuilder, EntityRepository} from "typeorm";
import { Service } from "typedi";
import { User } from "../entity";
import { BaseQueryRepo } from "./Base";
import {UserSearchReq} from "../api";

@Service()
@EntityRepository(User)
export class UserQueryRepo extends BaseQueryRepo {
  constructor() {
    super("user", "User");
  }

    search(param: UserSearchReq): Promise<[Array<any>, number]> {
      return createQueryBuilder("user")
          .where(`name like :name`, {
            name: `%${param.getName}%`,
          })
          .andWhere("public_address like :public_address", {public_address: `%${param.getAddress}%`})
          .skip(param.getOffset())
          .take(param.getLimit())
          .getManyAndCount();
    }
}
