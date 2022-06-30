import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { LogQueryRepo } from "../repository/LogQueryRepo";
import { Log } from "../entity";
import { PageResList } from "../api";
import { LogSearchReq } from "../api/request/LogSearchReq";

@Service()
export class LogService {
  constructor(
    @InjectRepository()
    readonly LogQueryRepo: LogQueryRepo
  ) {}

  async search(param: LogSearchReq): Promise<PageResList<Log>> {
    const result = await this.LogQueryRepo.findLogs(param);
    return new PageResList<Log>(
      result[1],
      param.limit,
      result[0].map((el: Log) => {
        return el;
      }),
      "Log 목록을 찾는데 성공했습니다."
    );
  }
}
