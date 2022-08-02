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
import { PageResObj, UserSearchReq} from "../api";
import { UserDto } from "../dto";
import { UserIdPasswordDto } from "../dto/User";
import {checkAccessToken, checkAdminAccessToken} from "../middlewares/Auth";
import { UserService } from "../service/User";

@Service()
@JsonController("/user")
export class UserController {
  @Inject()
  userService: UserService;

  @Get("/find")
  @UseBefore(checkAdminAccessToken)
  public async getAll(@QueryParams() param: UserSearchReq, @Res() res: Response) {
    try {
      return await this.userService.findAll(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/seller")
  @UseBefore(checkAdminAccessToken)
  public async getAllSeller(@QueryParams() param: UserSearchReq, @Res() res: Response) {
    try {
      return await this.userService.findAllSeller(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/find/:public_address")
  @UseBefore(checkAdminAccessToken)
  public async getOne(@Param("public_address") public_address: string, @Res() res: Response) {
    try {
      return await this.userService.findOne(public_address);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/create")
  @UseBefore(checkAdminAccessToken)
  public async create(@Body() params: UserDto, @Res() res: Response) {
    try {
      return await this.userService.create(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/register")
  @UseBefore(checkAccessToken)
  public async register(@Body() params: UserIdPasswordDto) {
    
  }
}
