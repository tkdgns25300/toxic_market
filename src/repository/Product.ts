import { createQueryBuilder, EntityRepository } from "typeorm";
import { Service } from "typedi";
import { Product } from "../entity";
import { BaseQueryRepo } from "./Base";
import { PageReq } from "../api";

@Service()
@EntityRepository(Product)
export class ProductQueryRepo extends BaseQueryRepo {
  constructor() {
    super("product", "Product");
  }

  findProducts(param: PageReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("product");

    let monthBeforeDate: Date = new Date();
    monthBeforeDate.setDate(monthBeforeDate.getDate() - 30);
    
    builder
    .andWhere('is_visible = :is_visible', {
      is_visible: 'O'
    })
    .andWhere(`created_at >= :from_date`, {
      from_date: monthBeforeDate
    })
    .orderBy('created_at', 'DESC');

    builder.skip(param.getOffset()).take(param.getLimit());

    return builder.getManyAndCount();
  }
}
