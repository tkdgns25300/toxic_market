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
import { BankDto } from "../dto";
import { BannerDto } from "../dto/Banner";
import { checkAccessToken, checkAdminAccessToken } from "../middlewares/Auth";
import { BankService } from "../service/Bank";

@Service()
@JsonController("/bank")
export class BankController {
  @Inject()
  bankService: BankService;

  @Get("/find")
  public async getAllBank(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      return await this.bankService.findAll(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/create")
  @UseBefore(checkAdminAccessToken)
  public async create(@Body() params: BankDto, @Res() res: Response) {
    try {
      return await this.bankService.create(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/user")
  @UseBefore(checkAccessToken)
  public async getAllBankWithUser(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;

      return await this.bankService.findBankWithUser(param, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  // 람다에서 사용할 컨트롤러
  // 1. 00시에 bank의 remaing_day = remaing_day - 1
  //    bankLog에서 accumulate_interest = accumulate_interest + expected_Daily_interest

  // 대상 bank들은 remaining_day가 1 이상인 bank

  // 2. 1에서 remaining_day가 1 => 0 bank는 원급을 지급한다
  // 트랜잭션으로 진행함

  @Post('/interest')
  public async payInterestAndDeposit(@Res() res: Response) {
    try {
      return await this.bankService.payInterestAndDeposit(null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
