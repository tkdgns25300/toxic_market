import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { ProductQueryRepo } from "../../repository/market/ProductQueryRepo";
import { Log, Product, User } from "../../entity/market";
import { LogDto, ProductDto } from "../../dto/market";
import { PageReq, PageResList, PageResObj } from "../../api";
import { LogQueryRepo } from "../../repository/market/LogQueryRepo";
import { EntityManager, Transaction, TransactionManager } from "typeorm";

@Service()
export class ProductService {
  constructor(
    @InjectRepository()
    readonly ProductQueryRepo: ProductQueryRepo,
    readonly LogQueryRepo: LogQueryRepo
  ) {}

  async findAll(param: PageReq): Promise<PageResList<Product>> {
    const result = await this.ProductQueryRepo.findProducts(param);
    return new PageResList<Product>(
      result[1],
      param.limit,
      result[0].map((el: Product) => {
        return el;
      }),
      "Product 목록을 찾는데 성공했습니다."
    );
  }

  async findOne(id: number): Promise<PageResObj<Product | {}>> {
    const result = await this.ProductQueryRepo.findOne("id", id);
    return new PageResObj(result, "Product 조회에 성공했습니다.");
  }

  async create(paramObj: ProductDto): Promise<PageResObj<Product | {}>> {
    // 수량이 0일 경우 null : 무제한
    if (paramObj.amount === 0) paramObj.amount = null;
    const product = await this.ProductQueryRepo.create(paramObj);
    const result: Product = await this.ProductQueryRepo.findOne(
      "id",
      product.identifiers[0].id
    );
    return new PageResObj(result, "Product 생성에 성공했습니다.");
  }

  @Transaction()
  async buy(
    id: number,
    amount: number,
    public_address: string,
    @TransactionManager() manager: EntityManager
  ): Promise<PageResObj<Product | {}>> {
    // 상품 수량 줄이기
    const product: Product = await manager.findOne(Product, { id: id });
    if (typeof product.amount === "number") {
      if (product.amount < amount)
        return new PageResObj({}, "Product 수량이 부족합니다.");
      else {
        product.amount -= amount;
        await manager.update(Product, id, product);
      }
    }

    // 구매자 CF 줄이기
    const buyer: User = await manager.findOne(User, {
      public_address: public_address,
    });
    if (buyer.CF_balance < product.price * amount) {
      return new PageResObj({}, "CF가 부족합니다.");
    }
    buyer.CF_balance -= product.price * amount;
    await manager.update(User, public_address, buyer);

    // 판매자 CF 올리기
    const seller: User = await manager.findOne(User, {
      public_address: product.user_address,
    });
    seller.CF_balance += product.price * amount;
    await manager.update(User, product.user_address, seller);

    // 로그 생성
    let logItem = manager.create(Log, {
      title: product.title,
      total_CF: product.price * amount,
      amount: amount,
      contact: product.contact,
      seller: seller.public_address,
      buyer: buyer.public_address,
    });
    logItem = await manager.save(Log, logItem);

    return new PageResObj({}, "Product 구매에 성공했습니다.");
  }
}
