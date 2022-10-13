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
	
		const orderAndLimitQuery = ` ORDER BY created_at DESC LIMIT 99999`;
		let notSoldOutQuery = `
		SELECT product.id, product.main_img_url, product.sub_img_url, product.price, product.amount, product.title, product.description, product.contact, product.created_at, product.user_address, product.is_visible
		FROM product 
		LEFT JOIN user 
		ON product.user_address = user.public_address 
		WHERE product.is_visible = "O" 
		AND (product.amount != 0 OR product.amount IS NULL)
		AND product.created_at >= "${monthBeforeDate.toISOString()}"`;
		if (param.getUserToxicProject) notSoldOutQuery += ` AND user.toxic_project = '${param.getUserToxicProject}'`;
		if (param.getUserCatboticaProject) notSoldOutQuery += ` AND user.catbotica_project = '${param.getUserCatboticaProject}'`;
		if (param.getName) notSoldOutQuery += ` AND user.name like '%${param.getName}%'`;
		if (param.getTitle) notSoldOutQuery += ` AND product.title like '%${param.getTitle}%'`;
		notSoldOutQuery += orderAndLimitQuery;
		
		let soldOutQuery = `
		SELECT product.id, product.main_img_url, product.sub_img_url, product.price, product.amount, product.title, product.description, product.contact, product.created_at, product.user_address, product.is_visible 
		FROM product 
		LEFT JOIN user 
		ON product.user_address = user.public_address 
		WHERE product.is_visible = "O" 
		AND product.amount = 0
		AND product.created_at >= "${monthBeforeDate.toISOString()}"`;
		if (param.getUserToxicProject) soldOutQuery += ` AND user.toxic_project = '${param.getUserToxicProject}'`;
		if (param.getUserCatboticaProject) soldOutQuery += ` AND user.catbotica_project = '${param.getUserCatboticaProject}'`;
		if (param.getName) soldOutQuery += ` AND user.name like '%${param.getName}%'`;
		if (param.getTitle) soldOutQuery += ` AND product.title like '%${param.getTitle}%'`;
		soldOutQuery += orderAndLimitQuery;

    // Product
		const result = await entityManager.query(`
			(${notSoldOutQuery})
      UNION ALL
	  	(${soldOutQuery})
      LIMIT ${param.getLimit()}
      OFFSET ${param.getOffset()};
		`);

    // Product 총 갯수
		let totalCountQuery = `
			SELECT COUNT(*) FROM product
			LEFT JOIN user
			ON product.user_address = user.public_address
			WHERE product.is_visible = 'O'
			AND product.created_at >= "${monthBeforeDate.toISOString()}"`;
		if (param.getUserToxicProject) totalCountQuery += ` AND user.toxic_project = '${param.getUserToxicProject}'`;
		if (param.getUserCatboticaProject) totalCountQuery += ` AND user.catbotica_project = '${param.getUserCatboticaProject}'`;
		if (param.getName) totalCountQuery += ` AND user.name like '%${param.getName}%'`;
		if (param.getTitle) totalCountQuery += ` AND product.title like '%${param.getTitle}%'`;

		let totalCount = await entityManager.query(totalCountQuery);
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
