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
import { LogSearchReq } from "../api/request/LogSearchReq";
import { ProjectSortingSearchReq } from "../api/request/ProjectSortingSearchReq";

@Service()
export class ProductService {
  constructor(
    @InjectRepository()
    readonly ProductQueryRepo: ProductQueryRepo,
    readonly userQueryRepo: UserQueryRepo,
    readonly LogQueryRepo: LogQueryRepo
  ) {}

  async findAll(param: ProjectSortingSearchReq): Promise<PageResList<Product>> {
    let result = await this.ProductQueryRepo.findProducts(param);
    // nickname, profile_img추가하여 리턴 : 좋지 않은 방식 => 원래는 product와 user에 manyToOne관계를 맺어서 처리해야함. but 프로젝트 크기가 크지 않아 속도 저하의 우려가 없어 이렇게 작성.
    for (const el of result[0]) {
      const creator = await this.userQueryRepo.findOne("public_address", el.user_address);
      el.name = creator.name;
      el.phone = creator.phone;
      el.nickname = creator.nickname;
      el.profile_img = creator.profile_img;
    }

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
    // nickname, profile_img추가하여 리턴 : 좋지 않은 방식 => 원래는 product와 user에 manyToOne관계를 맺어서 처리해야함. but 프로젝트 크기가 크지 않아 속도 저하의 우려가 없어 이렇게 작성.
    const creator = await this.userQueryRepo.findOne("public_address", result.user_address);
    result.name = creator.name;
    result.phone = creator.phone;
    result.nickname = creator.nickname;
    result.profile_img = creator.profile_img;
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

  async update(paramObj: ProductDto, id: number, public_address: string): Promise<PageResObj<Product | {}>> {
    let product = await this.ProductQueryRepo.findOne("id", id);
    let user = await this.userQueryRepo.findOne("public_address", public_address)

    if(product.user_address !== public_address && user.is_admin === 'X') { // 수정 가능한 조건 : 1. 본인이 만든 마켓, 2. 관리자
      return new PageResObj({}, "상품을 생성한 사용자와 관리자만 수정 가능합니다.", true);
    }

    if(user.seller_type === UserSellerType.INDIVIDUAL) {
      delete paramObj?.price
      delete paramObj?.amount
      delete paramObj?.title
      delete paramObj?.is_visible
    }
    if (paramObj.amount === 0 ) { // 무제한
      paramObj.amount = null;
    } else if (paramObj.amount === 'sold out') { // 상품 재고 0
      paramObj.amount = 0;
    } 

    await this.ProductQueryRepo.update(paramObj,"id", id);
    return new PageResObj({}, "Product 수정에 성공했습니다.");
  }

  async delete(id: number): Promise<PageResObj<Product | {}>> {
    const result = await this.ProductQueryRepo.delete('id', id);
    if(result.affected !== 1) {
      return new PageResObj({}, "Product 삭제에 실패하였습니다.", true);
    }
    return new PageResObj({}, "Product 삭제에 성공하였습니다.");
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

  async findUserProducts(param: PageReq, creator_address: string): Promise<PageResList<Product>> {
    const result = await this.ProductQueryRepo.findUserProducts(param, creator_address);
    // nickname, profile_img추가 하여 리턴 : 좋지 않은 방식 => but 프로젝트 크기가 크지 않아 속도 저하의 우려가 없어 이렇게 작성.
    for (const el of result[0]) {
      const creator = await this.userQueryRepo.findOne("public_address", creator_address);
      el.nickname = creator.nickname;
      el.profile_img = creator.profile_img;
      delete el.creator
    }
    return new PageResList<Product>(
      result[1],
      param.limit,
      result[0].map((el: Product) => {
        return el;
      }),
      "Product 목록을 찾는데 성공했습니다."
    );
  }

  async logSearch(param: LogSearchReq): Promise<PageResList<Log>> {
    const result = await this.LogQueryRepo.findLogs(param);
    return new PageResList<Log>(
      result[1],
      param.limit,
      result[0].map((el: Log) => {
        return el;
      }),
      "Log 목록을 찾는데 성공했습니다."
    );
  }
}
