import {
  Body,
  Get,
  JsonController,
  Param,
  Post,
  QueryParams,
  Patch,
  Res,
  UseBefore,
} from "routing-controllers";
import { Response } from "express";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";

import { UserService } from "../service/UserService";
import { UserDto } from "../dto";
import { PageReq, UserSearchReq, PageResObj } from "../api";
import {
  checkAccessToken,
  checkSuperAccessToken,
  extractAccessToken,
} from "../middlewares/AuthMiddleware";

@Service()
@JsonController("/admin")
export class AdminController {
  @Inject()
  adminService: UserService;

  @Get("/search")
  @UseBefore(checkAccessToken)
  public async getSearch(
    @QueryParams() param: UserSearchReq,
    @Res() res: Response
  ) {
    try {
      return await this.adminService.search(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/findone/:id")
  @UseBefore(checkAccessToken)
  public async getOne(@Param("id") id: string, @Res() res: Response) {
    try {
      return await this.adminService.findOne(id);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/create")
  @UseBefore(checkAccessToken)
  // @UseBefore(checkSuperAccessToken)
  public async create(
    @Body({ options: { limit: "20mb" } }) createDto: UserDto,
    @Res() res: Response
  ) {
    try {
      const jwtPayload = res.locals.jwtPayload;
      if (!jwtPayload.super) {
        throw new Error("슈퍼관리자가 아닙니다.");
      }
      return await this.adminService.create(createDto);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      console.log(err);
      return new PageResObj({}, err.message, true);
    }
  }

  @Patch("/update/:id")
  // @UseBefore(checkAccessToken)
  public async update(
    @Body({ options: { limit: "20mb" } }) updateDto: UserDto,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    try {
      return await this.adminService.update(updateDto, id);
    } catch (err) {
      console.log(err);
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
  @Post("/delete")
  // @UseBefore(checkAccessToken)
  public async delete(@Body() idArr: {id: string}[], @Res() res: Response) {
    try {
      const jwtPayload = res.locals.jwtPayload;
      if (!jwtPayload.super) {
        throw new Error("슈퍼관리자가 아닙니다.");
      }
      return await this.adminService.delete(idArr, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
