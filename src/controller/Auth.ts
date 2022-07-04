import {
  Body,
  Get,
  JsonController,
  Param,
  Post,
  Res,
  UseBefore,
} from "routing-controllers";
import { Request, Response } from "express";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";

import { AuthService } from "../service/AuthService";
import { PageResObj } from "../api";
import {
  checkAccessToken,
  generateAccessToken,
} from "../middlewares/AuthMiddleware";
import { User } from "../entity";

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
  public async login(
    @Body() data: { public_address: string; signature: string }
  ) {
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

  //TODO: delete this before deploying
  @Get("/getjwt/:address")
  public async getjwt(@Param("address") address: string) {
    try {
      const user = new User();

      user.public_address = address;

      const token = generateAccessToken(user);
      return new PageResObj({ token }, "로그인 성공했습니다.", false);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
