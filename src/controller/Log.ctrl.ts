import { Get, JsonController, QueryParams } from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageResObj } from "../api";
import { LogSearchReq } from "../api/request/LogSearchReq";
import { LogService } from "../service/LogService";

@Service()
@JsonController("/log")
export class LogController {
  @Inject()
  logService: LogService;

  @Get("/find")
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