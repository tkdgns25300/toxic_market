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

    builder.where(`${filter} = :${filter}`, {
      [filter]: param[filter],
    });

    builder.skip(param.getOffset()).take(param.getLimit());

    return builder.getManyAndCount();
  }

  findBuyProductLogs(public_address: string): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("log");

    builder
    .where(`buyer = :public_address`, {
      public_address: public_address,
    })
    .orderBy('created_at', 'DESC')
    
    return builder.getManyAndCount();
  }

  findSellProductLogs(public_address: string): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("log");

    builder
    .where(`seller = :public_address`, {
      public_address: public_address,
    })
    .orderBy('created_at', 'DESC')
    
    return builder.getManyAndCount();
  }
}
