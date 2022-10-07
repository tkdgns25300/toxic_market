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
    const builder = createQueryBuilder("user");

    builder
			.where(`name like :name`, {
				name: `%${param.getName}%`,
			})
			.andWhere("public_address like :public_address", {
				public_address: `%${param.getAddress}%`,
			});

    if (param.getUserToxicProject === 'O') {
      builder.andWhere(`toxic_project = 'O'`)
    }
    if (param.getUserCatboticaProject === 'O') {
      builder.andWhere(`catbotica_project = 'O'`)
    }

    builder.skip(param.getOffset()).take(param.getLimit());

    return builder.getManyAndCount();
  }

  searchSeller(param: UserSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("user");

    builder
      .where(`is_seller = 'O'`)
			.andWhere(`name like :name`, {
				name: `%${param.getName}%`,
			})
			.andWhere("public_address like :public_address", {
				public_address: `%${param.getAddress}%`,
			});

    if (param.getUserToxicProject === 'O') {
      builder.andWhere(`toxic_project = 'O'`)
    }
    if (param.getUserCatboticaProject === 'O') {
      builder.andWhere(`catbotica_project = 'O'`)
    }

    builder.skip(param.getOffset()).take(param.getLimit());

    return builder.getManyAndCount();
  }
}
