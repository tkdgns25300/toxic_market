import {
  Body,
  JsonController,
  Res,
  UseBefore,
  Post,
  Get,
  QueryParams,
  Param,
} from "routing-controllers";
import { Response } from "express";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";

import { ExchangeService } from "../service/Exchange";
import { PageResObj } from "../api";
import { checkAccessToken, checkAdminAccessToken } from "../middlewares/Auth";
import { ExchangeDto } from "../dto";
import { ExchangeLogSearchReq } from "../api/request/ExchangeLogSearchReq";
import { CommissionReq } from "../api/request/CommissionReq";

@Service()
@JsonController("/exchange")
export class ExchangeController {
  @Inject()
  exchangeService: ExchangeService;

  @Post("/coin")
  @UseBefore(checkAccessToken)
  public async toxToPoint(@Body() data: ExchangeDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.exchangeService.toxToPoint(data.amount, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/point")
  @UseBefore(checkAccessToken)
  public async pointToTox(@Body() data: ExchangeDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.exchangeService.pointToTox(data.amount, aud, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/log")
  @UseBefore(checkAdminAccessToken)
  public async findExchangeLogs(@QueryParams() param: ExchangeLogSearchReq) {
    try {
      return await this.exchangeService.findExchangeLogs(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/log/:id")
  @UseBefore(checkAdminAccessToken)
  public async findExchangeLogsById(@Param("id") id: number) {
    try {
      return await this.exchangeService.findExchangeLogsById(id);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/commission/:id")
  @UseBefore(checkAdminAccessToken)
  public async returnCommissionById(@Param("id") id: number, @Body() param: CommissionReq) {
    try {
      return await this.exchangeService.returnCommissionById(id, param, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
