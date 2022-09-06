import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { Log } from "../entity";
import { BaseQueryRepo } from "./Base";
import { LogSearchReq } from "../api/request/LogSearchReq";
import { PageReq } from "../api";

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

  findBuyLogs(param: PageReq, public_address: string): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("log");

    builder
    .andWhere(`buyer = ${public_address}`)
    .skip(param.getOffset())
    .take(param.getLimit());
    
    return builder.getManyAndCount();
  }

  findSellLogs(param: PageReq, public_address: string): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("log");

    builder
    .andWhere(`seller = ${public_address}`)
    .skip(param.getOffset())
    .take(param.getLimit());
    
    return builder.getManyAndCount();
  }
}
