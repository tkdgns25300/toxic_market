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

  @Get("/find") // 관리자 페이지에서 사용되는 뱅크 조회
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

  @Post("/create") // 뱅크 생성
  // @UseBefore(checkAdminAccessToken)
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

  @Get("/user") // 서비스 페이지에서 사용되는 뱅크 조회(해당 사용자의 뱅크 예치 내역이 담김)
  // @UseBefore(checkAccessToken)
  public async getAllBankWithUser(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      // const { aud } = res.locals.jwtPayload;

      const aud = '0x0034daa364f2cd970f74cb7d413b9db4a93a5e46';
      
      return await this.bankService.findBankWithUser(param, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  // 람다에서 사용할 컨트롤러 => 예치 중인 사용자에게 일일 보상 지급 및 만기 뱅크 예치금 지급
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
