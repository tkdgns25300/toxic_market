import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";

import { User } from "../entity";
import { UserDto } from "../dto";
import { PageReq, UserSearchReq } from "../api";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(User)
export class UserQueryRepo extends BaseQueryRepo {
  constructor() {
    super("admin", "Admin");
  }

  search(param: UserSearchReq) {
    return createQueryBuilder()
      .select("admin")
      .from(User, "admin")
      .where(`admin.${param.getColumn} like :${param.getColumn} `, {
        [param.getColumn]: `%${param.getKeyword}%`,
      })
      .skip(param.getOffset())
      .take(param.getLimit())
      .getManyAndCount();
  }

  // 비밀번호를 포함하기 때문에 로그인에서만 사용
  loginFindOne(admin_id: string) {
    return createQueryBuilder()
      .select("admin")
      .addSelect("admin.password")
      .from(User, "admin")
      .where("admin_id = :admin_id", { admin_id })
      .getOne();
  }
}
