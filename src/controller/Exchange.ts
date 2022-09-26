import {
  Body,
  JsonController,
  Res,
  UseBefore,
  Post,
  Get,
} from "routing-controllers";
import { Response } from "express";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";

import { ExchangeService } from "../service/Exchange";
import { PageResObj } from "../api";
import { checkAccessToken, checkAdminAccessToken } from "../middlewares/Auth";
import { ExchangeDto } from "../dto";

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

  @Get("/log/coin")
  @UseBefore(checkAdminAccessToken)
  public async toxToPointLog() {
    try {
      return await this.exchangeService.toxToPointLog();
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/log/piont")
  @UseBefore(checkAdminAccessToken)
  public async pointToToxLog() {
    try {
      return await this.exchangeService.pointToToxLog();
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
