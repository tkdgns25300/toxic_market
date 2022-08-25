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
import { BannerDto } from "../dto/Banner";
import { checkAdminAccessToken } from "../middlewares/Auth";
import { BankLogService } from "../service/BankLog";

@Service()
@JsonController("/banklog")
export class BankLogController {
  @Inject()
  bankLogService: BankLogService;
}
