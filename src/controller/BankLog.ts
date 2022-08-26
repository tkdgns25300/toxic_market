import { Response } from "express";
import {
  Body,
  Get,
  Post,
  JsonController, 
  Res,
  UseBefore,
  QueryParams,
  Param,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq, PageResObj } from "../api";
import { BankLogDto } from "../dto";
import { BannerDto } from "../dto/Banner";
import { checkAccessToken, checkAdminAccessToken } from "../middlewares/Auth";
import { BankLogService } from "../service/BankLog";

@Service()
@JsonController("/banklog")
export class BankLogController {
  @Inject()
  bankLogService: BankLogService;

  @Post("/create")
  @UseBefore(checkAccessToken)
  public async create(@Body() params: BankLogDto, @Res() res: Response) {
    try {
      return await this.bankLogService.create(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post('/withdraw/:id')
  @UseBefore(checkAccessToken)
  public async withdraw(@Param("id") id: number, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;

      return await this.bankLogService.withdraw(id, aud, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
