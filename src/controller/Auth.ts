import {
  Body,
  Get,
  JsonController,
  Post,
  Res,
  UseBefore,
} from "routing-controllers";
import { Request, Response } from "express";
import { Inject, Service } from "typedi";
import { AuthService } from "../service/Auth";
import { LoginDto } from "../dto";
import { PageResObj } from "../api";

import { checkAccessToken } from "../middlewares/Auth";
import { QueryFailedError } from "typeorm";

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
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/login")
  public async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      return await this.authService.login(loginDto.getHashAdminInfo());
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
