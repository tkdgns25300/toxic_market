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
import { BannerService } from "../service/Banner";

@Service()
@JsonController("/banner")
export class BannerController {
  @Inject()
  bannerService: BannerService;

  @Post("/create")
  @UseBefore(checkAdminAccessToken)
  public async create(@Body() params: BannerDto, @Res() res: Response) {
    try {
      return await this.bannerService.create(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/find")
  public async getAllBanner(@Res() res: Response) {
    try {
      return await this.bannerService.findAll();
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
