import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { ExchangeLog } from "../entity";
import { BaseQueryRepo } from "./Base";
import { PageReq } from "../api";
import { ExchangeLogSearchReq } from "../api/request/ExchangeLogSearchReq";

@Service()
@EntityRepository(ExchangeLog)
export class ExchangeLogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("exchange_log", "ExchangeLog");
  }

  findExchangeLogs(param: ExchangeLogSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("exchange_log");

    if (param.user_toxic_project === 'O') {
      builder.andWhere(`toxic_project = 'O'`)
    }
    if (param.user_catbotica_project === 'O') {
      builder.andWhere(`catbotica_project = 'O'`)
    }

    builder.skip(param.getOffset()).take(param.getLimit());

    return builder.getManyAndCount();
  }
}
