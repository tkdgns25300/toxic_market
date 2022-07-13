import { Response } from "express";
import {
  Body,
  Get,
  JsonController,
  Param,
  Post,
  QueryParams,
  Res,
  UseBefore,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq, PageResObj } from "../api";
import { UserDto } from "../dto";
import { checkAccessToken } from "../middlewares/Auth";
import { UserService } from "../service/User";

@Service()
@JsonController("/user")
export class UserController {
  @Inject()
  userService: UserService;

  @Get("/find")
  public async getAll(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      return await this.userService.findAll(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/find/:id")
  @UseBefore(checkAccessToken)
  public async getOne(@Param("id") id: number, @Res() res: Response) {
    try {
      return await this.userService.findOne(id);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/create")
  @UseBefore(checkAccessToken)
  public async create(@Body() params: UserDto, @Res() res: Response) {
    try {
      // 등록시 필요한 유저 지갑은 request로 받는 게 아닌 토큰에서 추출
      return await this.userService.create(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

}
