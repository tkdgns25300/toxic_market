import { Response } from "express";
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Patch,
  Post,
  QueryParams,
  Res,
  UseBefore,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageResObj, UserSearchReq} from "../api";
import { UserDto } from "../dto";
import { UserIdPasswordDto, UserPasswordDto, UserProfileDto, UserAddressDto } from "../dto/User";
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

  @Patch("/seller/:public_address")
  @UseBefore(checkAdminAccessToken)
  public async updateSeller(@Param("public_address") public_address: string, @Body() params: UserDto, @Res() res: Response) {
    try {
      return await this.userService.updateSeller(public_address, params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/register")
  @UseBefore(checkAccessToken)
  public async register(@Body() params: UserIdPasswordDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.userService.register(params, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Patch("/password")
  @UseBefore(checkAccessToken)
  public async updatePassword(@Body() params: UserPasswordDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.userService.updatePassword(params, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Patch("/profile")
  @UseBefore(checkAccessToken)
  public async updateProfile(@Body() params: UserProfileDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.userService.updateProfile(params, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Delete("/delete")
  @UseBefore(checkAdminAccessToken) // 관리자만 회원탈퇴 시키는 게 가능한 걸로 확인됨  1. admin인지 여부를 확인한다
  // 유저가 탈퇴 가능한 지 여부를 확인해서 유저 탈퇴 시 로직을 추가시키기
  public async delete(@Body() params: UserAddressDto, @Res() res: Response) { // 2. 탈퇴 시키려는 사용자의 지갑주소를 바디값으로 받는다
    try {
      return await this.userService.delete(params.public_address);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
