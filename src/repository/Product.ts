import { createQueryBuilder, EntityRepository, getManager } from "typeorm";
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

  /**
   * Typeorm 은 UNION 기능이 없어 amount !== 0인 경우와 amount === 0인 경우 따로 쿼리 후 service에서 Union
   */
  async findProducts(param: PageReq): Promise<any> {
    let monthBeforeDate: Date = new Date();
    monthBeforeDate.setDate(monthBeforeDate.getDate() - 30);
    /*
    // amount !== 0인 경우
    const builder = createQueryBuilder("product");
    
    builder
    .andWhere('is_visible = :is_visible', {
      is_visible: 'O'
    })
    .andWhere(`created_at >= :from_date`, {
      from_date: monthBeforeDate
    })
    .andWhere('amount != 0 OR amount IS NULL')
    .addOrderBy('created_at', 'DESC')

    builder.skip(param.getOffset()).take(param.getLimit());

    // amount === 0인 경우
    const builderUnion = createQueryBuilder("product");
    
    builderUnion
    .andWhere('is_visible = :is_visible', {
      is_visible: 'O'
    })
    .andWhere(`created_at >= :from_date`, {
      from_date: monthBeforeDate
    })
    .andWhere('amount = 0')
    .addOrderBy('created_at', 'DESC')

    builderUnion.skip(param.getOffset()).take(param.getLimit());
    
    return [builder.getManyAndCount(), builderUnion.getManyAndCount()];
    */
  const entityManager = getManager();

  // const tableUn = createQueryBuilder("product")
  // .select('*')
  // .andWhere('is_visible = "O"')
  // // .andWhere(`created_at >= :from_date`, {
  // //   from_date: monthBeforeDate
  // // })
  // .andWhere('amount != 0')
  // .addOrderBy('created_at', 'DESC')
  // .getQuery();
  // console.log(tableUn)

  // const tableTg = createQueryBuilder("product")
  // .select('*')
  // .andWhere('is_visible = "O"')
  // // .andWhere(`created_at >= :from_date`, {
  // //   from_date: monthBeforeDate
  // // })
  // .andWhere('amount = 0')
  // .addOrderBy('created_at', 'DESC')
  // .getQuery();
  // console.log(tableTg)

  const result = await entityManager.query(`(SELECT * FROM product WHERE is_visible = "O" AND (amount != 0 OR amount IS NULL) ORDER BY created_at DESC LIMIT 10) UNION ALL (SELECT * FROM product WHERE is_visible = "O" AND amount = 0 ORDER BY created_at DESC LIMIT 10);`)
  console.log(result.getManyAndCount())
  return result.getManyAndCount();
  // const builder = createQueryBuilder("product");
  
  // builder
  // .andWhere('is_visible = :is_visible', {
  //   is_visible: 'O'
  // })
  // .andWhere(`created_at >= :from_date`, {
  //   from_date: monthBeforeDate
  // })
  // .orderBy('amount', 'DESC')
  // .addOrderBy('created_at', 'DESC')

  // builder.skip(param.getOffset()).take(param.getLimit());

  // return builder.getManyAndCount();

  }
}
