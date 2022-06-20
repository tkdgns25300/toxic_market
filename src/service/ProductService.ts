import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { ProductQueryRepo } from '../repository/ProductQueryRepo';
import { Product } from '../entity';
import { ProductDto } from '../dto';
import { PageReq, PageResList, PageResObj } from '../api';

@Service()
export class ProductService {
  constructor(
    @InjectRepository()
    readonly ProductQueryRepo: ProductQueryRepo
  ) { }

  async findAll(param: PageReq): Promise<PageResList<Product>> {
    const result = await this.ProductQueryRepo.findAll(param);
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
    return new PageResObj(result, "Product 조회에 성공했습니다.")
  }

  async create(paramObj: ProductDto): Promise<PageResObj<Product | {}>> {
    const product = await this.ProductQueryRepo.create(paramObj);
    const result: Product = await this.ProductQueryRepo.findOne(
      "id",
      product.identifiers[0].id
    );
    return new PageResObj(result, "Product 생성에 성공했습니다.")
  }
}