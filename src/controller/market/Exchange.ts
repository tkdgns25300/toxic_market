import {
  Body,
  JsonController,
  Res,
  UseBefore,
  Post,
} from "routing-controllers";
import { Response } from "express";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";

import { ExchangeService } from "../../service/market/ExchangeService";
import { PageResObj } from "../../api";
import { checkAccessToken } from "../../middlewares/AuthMiddleware";
import { ExchangeDto } from "../../dto/market";

@Service()
@JsonController("/market/exchange")
export class ExchangeController {
  @Inject()
  exchangeService: ExchangeService;

  @Post("/coin")
  @UseBefore(checkAccessToken)
  public async toxToPoint(@Body() data: ExchangeDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.exchangeService.toxToPoint(data.amount, aud, null);
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
}
