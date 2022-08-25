import { Response } from "express";
import {
  Body,
  Get,
  Post,
  JsonController, 
  Res,
  UseBefore,
  QueryParams,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq, PageResObj } from "../api";
import { BankDto } from "../dto";
import { BannerDto } from "../dto/Banner";
import { checkAdminAccessToken } from "../middlewares/Auth";
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
}
