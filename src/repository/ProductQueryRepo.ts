import { EntityRepository } from "typeorm";
import { Service } from "typedi";
import { Product } from "../entity";
import { BaseQueryRepo } from "./BaseQueryRepo";

@Service()
@EntityRepository(Product)
export class ProductQueryRepo extends BaseQueryRepo {
  constructor() {
    super("product", "Product");
  }
}
