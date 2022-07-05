import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { Log } from "../../entity/market";
import { BaseQueryRepo } from "./BaseQueryRepo";
import { LogSearchReq } from "../../api/request/LogSearchReq";

@Service()
@EntityRepository(Log)
export class LogQueryRepo extends BaseQueryRepo {
  constructor() {
    super("log", "Log");
  }

  findLogs(param: LogSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("log");

    const filter = param.getUser;

    builder.andWhere(`${filter} = :${filter}`, {
      [filter]: param[filter],
    });

    builder.skip(param.getOffset()).take(param.getLimit());

    return builder.getManyAndCount();
  }
}
