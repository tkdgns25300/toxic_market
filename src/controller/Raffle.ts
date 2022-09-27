import { Response } from "express";
import { Body, Get, JsonController, Param, Patch, Post, QueryParams, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq, PageResObj } from "../api";
import { checkAdminReq } from "../api/request/CheckAdminReq";
import { RaffleLogSearchReq } from "../api/request/RaffleLogSearchReq";
import { RaffleSearchReq } from "../api/request/RaffleSearchReq";
import { AgreeRaffleServiceDto, ApplyDto, RaffleConfirmDto, RaffleDto, RaffleFinishDto } from "../dto/Raffle";
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
      params.creator = aud;
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

  @Get("/unapproved")
  @UseBefore(checkAdminAccessToken)
  public async getAllNotApproved(@QueryParams() params: RaffleSearchReq) {
    try {
      return await this.raffleService.findAllNotApproved(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/ongoing")
  @UseBefore(checkAdminAccessToken)
  public async getAllApprovedAndNotFinished(@QueryParams() params: RaffleSearchReq) {
    try {
      return await this.raffleService.findAllApprovedAndNotFinished(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/finished")
  @UseBefore(checkAdminAccessToken)
  public async getAllApprovedAndFinished(@QueryParams() params: RaffleSearchReq) {
    try {
      return await this.raffleService.findAllApprovedAndFinished(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/approved")
  public async getAllApproved(@QueryParams() params: PageReq) {
    try {
      return await this.raffleService.findAllApproved(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/apply")
  @UseBefore(checkAccessToken)
  public async aply(@Body() params: ApplyDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.raffleService.apply(params, aud, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/find/:id")
  public async getOne(@Param("id") id: number, @QueryParams() param: checkAdminReq, @Res() res: Response) {
    try {
      return await this.raffleService.getOne(id, param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/select/:id")
  @UseBefore(checkAdminAccessToken)
  public async selectWinner(@Param("id") id: number) {
    try {
      return await this.raffleService.selectWinner(id);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/raffle_logs")
  @UseBefore(checkAccessToken)
  public async getBids(@QueryParams() param: RaffleLogSearchReq) {
    try {
      return await this.raffleService.findRaffleLogs(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/user")
  @UseBefore(checkAccessToken)
  public async getUserRaffles(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.raffleService.findUserRaffles(param, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/finish/:id")
  @UseBefore(checkAdminAccessToken)
  public async finish(@Param("id") id: number, @Body() param: RaffleFinishDto, @Res() res: Response) {
    try {
      return await this.raffleService.finish(param, id, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Patch("/update/:id")
  @UseBefore(checkAccessToken)
  public async update(@Param("id") id: number, @Body() param: RaffleDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.raffleService.update(param, id, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/agree")
  @UseBefore(checkAccessToken)
  public async agree(@Body() param: AgreeRaffleServiceDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.raffleService.agree(param, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}