import {
  Get,
  JsonController,
  Param,
  Res,
  UseBefore,
} from "routing-controllers";
import { Response } from "express";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";

import { UserService } from "../service/UserService";
import { PageResObj } from "../api";
import {
  checkAccessToken,
} from "../middlewares/AuthMiddleware";

@Service()
@JsonController("/admin")
export class AdminController {
  @Inject()
  adminService: UserService;



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


}
