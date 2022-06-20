import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { Log } from "../entity";
import { BaseQueryRepo } from "./BaseQueryRepo";
import { LogSearchReq } from "../api/request/LogSearchReq";

@Service()
@EntityRepository(Log)
export class LogQueryRepo extends BaseQueryRepo {
  constructor() {
    super('log', 'Log');
  }

  findLogs(param: LogSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("log");

    if (param.public_address) {
      builder.andWhere("log.public_address = :public_address", {
        public_address: param.public_address
      });
    }
    
    builder.skip(param.getOffset()).take(param.getLimit());

    return builder.getManyAndCount();
  }
}
