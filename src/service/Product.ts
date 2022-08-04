import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { ProductQueryRepo } from "../repository/Product";
import { Log, Product, User } from "../entity";
import { ProductDto } from "../dto";
import { PageReq, PageResList, PageResObj } from "../api";
import { LogQueryRepo } from "../repository/Log";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import {UserQueryRepo} from "../repository/User";
import {UserSellerType} from "../enum";

@Service()
export class ProductService {
  constructor(
    @InjectRepository()
    readonly ProductQueryRepo: ProductQueryRepo,
    readonly userQueryRepo: UserQueryRepo,
    readonly LogQueryRepo: LogQueryRepo
  ) {}

  async findAll(param: PageReq): Promise<PageResList<Product>> {
    let result = await this.ProductQueryRepo.findProducts(param);
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

  async update(paramObj: ProductDto, id: number): Promise<PageResObj<Product | {}>> {

    let product = await this.ProductQueryRepo.findOne("id", id);
    if(product.user_address !== paramObj.user_address) {
      return new PageResObj({}, "상품을 생성한 사용자만 수정 가능합니다.", true);
    }

    let user = await this.userQueryRepo.findOne("public_address", paramObj.user_address)
    if(user.seller_type === UserSellerType.INDIVIDUAL) {
      delete paramObj?.price
      delete paramObj?.amount
      delete paramObj?.title
    }
    if (paramObj.amount === 0) {
      paramObj.amount = null;
    }

    await this.ProductQueryRepo.update(paramObj,"id", id);
    return new PageResObj({}, "Product 수정에 성공했습니다.");
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
    await manager.save(Log, logItem);

    const result: Product = await manager.findOne(Product, { id: id });
    return new PageResObj(result, "Product 구매에 성공했습니다.");
  }
}
