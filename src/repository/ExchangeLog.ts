import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { ExchangeLog } from "../entity";
import { BaseQueryRepo } from "./Base";
import { PageReq } from "../api";
import { ProjectSortingSearchReq } from "../api/request/ProjectSortingSearchReq";

@Service()
@EntityRepository(ExchangeLog)
export class ExchangeLogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("exchange_log", "ExchangeLog");
  }

  findExchangeLogs(param: ProjectSortingSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("exchange_log");

    if (param.getUserToxicProject) {
      builder.andWhere(`user_toxic_project = :user_toxic_project`, {
        user_toxic_project: param.getUserToxicProject
      })
    }
    if (param.getUserCatboticaProject) {
      builder.andWhere(`user_catbotica_project = :user_catbotica_project`, {
        user_catbotica_project: param.getUserCatboticaProject
      })
    }

    builder.skip(param.getOffset()).take(param.getLimit());

    return builder.getManyAndCount();
  }
}
