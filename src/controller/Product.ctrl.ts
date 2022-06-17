import { Response } from "express";
import { Get, JsonController, QueryParams, Res } from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq } from "../api";
import { ProductService } from "../service/ProductService";

@Service()
@JsonController("/admin")
export class ProductController {
  @Inject()
  productService: ProductService;

  @Get("/find")
  public async findAll(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      return await this.productService.findAll(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        
      }
    }
  }
}