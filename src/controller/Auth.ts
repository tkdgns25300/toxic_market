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

import { AuthService } from "../service/Auth";
import { PageResObj } from "../api";
import {
  checkAccessToken,
  generateAccessToken,
} from "../middlewares/Auth";
import { User } from "../entity";
import { UserIdPasswordDto } from "../dto/User";

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
  // @Post("/login/wallet")
  public async walletLogin(
    @Body() data: { public_address: string; signature: string }
  ) {
    try {
      return this.authService.walletLogin(data);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  // @Post("/login/general")
  // public async generalLogin(@Body() params: UserIdPasswordDto) {
  //   try {
  //     return this.authService.generalLogin(params);
  //   } catch (err) {
  //     if (err instanceof QueryFailedError) {
  //       return new PageResObj({}, err.message, true);
  //     }
  //     return new PageResObj({}, err.message, true);
  //   }
  // }

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
      user.is_admin = "O"
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
