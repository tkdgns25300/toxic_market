import { Service } from "typedi";
import { createQueryBuilder, EntityRepository } from "typeorm";
import { Banner } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(Banner)
export class BannerQueryRepo extends BaseQueryRepo {
  constructor() {
    super("banner", "Banner");
  }

  findAll(): Promise<[Array<any>, number]> {
    return createQueryBuilder("banner")
        .getManyAndCount();
  }
}
