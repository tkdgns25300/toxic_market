import { createQueryBuilder, EntityRepository, getManager } from "typeorm";
import { Service } from "typedi";
import { Product } from "../entity";
import { BaseQueryRepo } from "./Base";
import { PageReq } from "../api";
import { ProjectSortingSearchReq } from "../api/request/ProjectSortingSearchReq";

@Service()
@EntityRepository(Product)
export class ProductQueryRepo extends BaseQueryRepo {
	constructor() {
		super("product", "Product");
	}

	async findProducts(param: ProjectSortingSearchReq): Promise<any> {
		let monthBeforeDate: Date = new Date();
		monthBeforeDate.setDate(monthBeforeDate.getDate() - 30);
		const entityManager = getManager();

		/**
		 * 관계설정 후 Product에 유저의 닉네임 추가하는 방식(기존 데이터가 꼬일 우려가 있어 시도 어려움)
		// 품절되지 않은 상품들
		const notSoldoutProducts = await createQueryBuilder("product")
		.leftJoinAndSelect("Product.user_address", "user")
		.select([
			"Product",
			"user.public_address",
			"user.name"
		])
		.where('amount != 0 OR amount IS NULL')
		.andWhere('is_visible = :is_visible', {
      is_visible: 'O'
    })
		.andWhere(`created_at >= :from_date`, {
      from_date: monthBeforeDate
    })
		.orderBy('Product.created_at', 'DESC')
		.skip(param.getOffset())
		.take(param.getLimit())
		.getManyAndCount();

		// 품절 상품들
		const soldoutProducts = await createQueryBuilder("product")
		.leftJoinAndSelect("Product.user_address", "user")
		.select([
			"Product",
			"user.public_address",
			"user.name"
		])
		.where('amount = 0')
		.andWhere('is_visible = :is_visible', {
      is_visible: 'O'
    })
		.andWhere(`created_at >= :from_date`, {
      from_date: monthBeforeDate
    })
		.orderBy('Product.created_at', 'DESC')
		.skip(param.getOffset())
		.take(param.getLimit())
		.getManyAndCount();
		*/

    // Product
		const result = await entityManager.query(
			`(SELECT product.id, product.main_img_url, product.sub_img_url, product.price, product.amount, product.title, product.description, product.contact, product.created_at, product.user_address, product.is_visible FROM product LEFT JOIN user ON product.user_address = user.public_address WHERE product.is_visible = "O" AND (product.amount != 0 OR product.amount IS NULL) AND product.created_at >= ? AND user.toxic_project = ? AND user.catbotica_project = ? ORDER BY created_at DESC LIMIT 99999)
      UNION ALL
	  (SELECT product.id, product.main_img_url, product.sub_img_url, product.price, product.amount, product.title, product.description, product.contact, product.created_at, product.user_address, product.is_visible FROM product LEFT JOIN user ON product.user_address = user.public_address WHERE product.is_visible = "O" AND product.amount = 0 AND product.created_at >= ? AND user.toxic_project = ? AND user.catbotica_project = ? ORDER BY created_at DESC LIMIT 99999)
      LIMIT ${param.getLimit()}
      OFFSET ${param.getOffset()};`
		, [monthBeforeDate, param.getUserToxicProject, param.getUserCatboticaProject, monthBeforeDate, param.getUserToxicProject, param.getUserCatboticaProject]);

    // Product 총 갯수
		let totalCount = await entityManager.query(`SELECT COUNT(*) FROM product LEFT JOIN user ON product.user_address = user.public_address WHERE product.is_visible = 'O' AND product.created_at >= ? AND user.toxic_project = ? AND user.catbotica_project = ?`, [monthBeforeDate, param.getUserToxicProject, param.getUserCatboticaProject]);
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
