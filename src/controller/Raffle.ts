import { Response } from "express";
import { Body, JsonController, Param, Post, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageResObj } from "../api";
import { RaffleConfirmDto, RaffleDto } from "../dto/Raffle";
import { checkAccessToken, checkAdminAccessToken } from "../middlewares/Auth";
import { RaffleService } from "../service/Raffle";

@Service()
@JsonController("/raffle")
export class RaffleController {
  @Inject()
  raffleService: RaffleService;

  @Post("/create")
  @UseBefore(checkAccessToken)
  public async create(@Body() params: RaffleDto, @Res() res: Response) {
    try {
      // 등록시 필요한 유저 지갑은 request로 받는 게 아닌 토큰에서 추출
      const { aud } = res.locals.jwtPayload;
      params.creator_address = aud;
      return await this.raffleService.create(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/confirm/:id")
  @UseBefore(checkAdminAccessToken)
  public async confirm(@Param("id") id: number, @Body() params: RaffleConfirmDto) {
    try {
      return await this.raffleService.confirm(params, id);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}