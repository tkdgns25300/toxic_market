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

	async findProducts(param: PageReq): Promise<any> {
		let monthBeforeDate: Date = new Date();
		monthBeforeDate.setDate(monthBeforeDate.getDate() - 30);
		const entityManager = getManager();

    // Product
		const result = await entityManager.query(
			`(SELECT * FROM product WHERE is_visible = "O" AND (amount != 0 OR amount IS NULL) ORDER BY created_at DESC LIMIT 99999)
      UNION ALL
      (SELECT * FROM product WHERE is_visible = "O" AND amount = 0 ORDER BY created_at DESC LIMIT 99999)
      LIMIT ${param.getLimit()}
      OFFSET ${param.getOffset()};`
		);

    // Product 총 갯수
		let totalCount = await entityManager.query(`SELECT COUNT(*) FROM product`);
		totalCount = Number(totalCount[0]["COUNT(*)"]);

		return [result, totalCount];
	}

	findUserProducts(param: PageReq, creator_address:string): Promise<[Array<any>, number]> {
		const builder = createQueryBuilder("product");

		builder
		.select()
		.where(`user_address = :user_address`, {
			user_address: creator_address
		})

		builder.skip(param.getOffset()).take(param.getLimit());
    	return builder.getManyAndCount();
	}
}
