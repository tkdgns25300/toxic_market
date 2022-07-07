import {
  Get,
  JsonController,
  QueryParams,
  UseBefore,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageResObj } from "../api";
import { LogSearchReq } from "../api/request/LogSearchReq";
import { checkAccessToken } from "../middlewares/Auth";
import { LogService } from "../service/Log";

@Service()
@JsonController("/market/log")
export class LogController {
  @Inject()
  logService: LogService;

  @Get("/find")
  @UseBefore(checkAccessToken)
  public async search(@QueryParams() params: LogSearchReq) {
    try {
      return await this.logService.search(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
