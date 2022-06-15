import {
  Body,
  Get,
  JsonController, Param,
  Post,
  Res,
  UseBefore,
} from "routing-controllers";
import { Request, Response } from "express";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";

import { AuthService } from "../service/AuthService";
import {PageResObj} from "../api";
import { checkAccessToken } from "../middlewares/AuthMiddleware";


@Service()
@JsonController("/auth")
export class AuthController {
  @Inject()
  authService: AuthService;

  @Get("/info")
  @UseBefore(checkAccessToken)
  public async getAdminInfo(@Res() res: Response, @Res() req: Request) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.authService.findOne(aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }


  @Get("/login/:address")
  public async findByAddress(@Param("address") address: string) {
    try {
      return this.authService.findOne(address);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/login")
  public async login( @Body()  data:{publicAddress: string, signature:string}) {
    try {
      return this.authService.login(data);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/signup/:address")
  public async signup(@Param("address") address: string) {
    try {
      return this.authService.signup(address);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }


}
