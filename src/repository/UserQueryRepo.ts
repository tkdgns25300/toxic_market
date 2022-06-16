import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { User } from "../entity";
import { UserSearchReq } from "../api";
import { BaseQueryRepo } from "./BaseQueryRepo";

@Service()
@EntityRepository(User)
export class UserQueryRepo extends BaseQueryRepo {
  constructor() {
    super('user', 'User');
  }


  search(param: UserSearchReq) {
    return createQueryBuilder()
      .select("user")
      .from(User, "user")
      .where(`user.${param.getColumn} like :${param.getColumn} `, {
        [param.getColumn]: `%${param.getKeyword}%`,
      })
      .skip(param.getOffset())
      .take(param.getLimit())
      .getManyAndCount();
  }


}
