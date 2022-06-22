import { Response } from "express";
import { Body, Get, JsonController, Param, Post, QueryParams, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq, PageResObj } from "../api";
import { ProductDto } from "../dto";
import { checkAccessToken } from "../middlewares/AuthMiddleware";
import { ProductService } from "../service/ProductService";

@Service()
@JsonController("/product")
export class ProductController {
  @Inject()
  productService: ProductService;

  @Get("/find")
  // @UseBefore(checkAccessToken)
  public async getAll(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      return await this.productService.findAll(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/find/:id")
  // @UseBefore(checkAccessToken)
  public async getOne(@Param("id") id: number, @Res() res: Response) {
    try {
      return await this.productService.findOne(id);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/create")
  // @UseBefore(checkAccessToken)
  public async create(@Body() params: ProductDto, @Res() res: Response) {
    try {
      return await this.productService.create(params);
    } catch(err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/buy/:id")
  // @UseBefore(checkAccessToken)
  public async buy(@Param("id") id: number, @QueryParams() obj, @Res() res: Response) {
    try {
      const {aud} = res.locals.jwtPayload;
      return await this.productService.buy(id, obj.amount, aud, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.log("Instance of QueryFailedError!");
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}