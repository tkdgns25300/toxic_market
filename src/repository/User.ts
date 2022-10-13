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
			.where("public_address like :public_address", {
				public_address: `%${param.getAddress}%`,
			});

    if (param.getId) {
      builder.andWhere("id like :id", {
        id: `%${param.getId}%`
      })
    }

    if (param.getUserToxicProject) {
      builder.andWhere(`toxic_project = :user_toxic_project`, {
        user_toxic_project: param.getUserToxicProject
      })
    }
    if (param.getUserCatboticaProject) {
      builder.andWhere(`catbotica_project = :user_catbotica_project`, {
        user_catbotica_project: param.getUserCatboticaProject
      })
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

      if (param.getUserToxicProject) {
        builder.andWhere(`toxic_project = :user_toxic_project`, {
          user_toxic_project: param.getUserToxicProject
        })
      }
      if (param.getUserCatboticaProject) {
        builder.andWhere(`catbotica_project = :user_catbotica_project`, {
          user_catbotica_project: param.getUserCatboticaProject
        })
      }

    builder.skip(param.getOffset()).take(param.getLimit());

    return builder.getManyAndCount();
  }
}
