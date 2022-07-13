import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserQueryRepo } from "../repository/User";
import { User } from "../entity";
import { UserDto } from "../dto";
import { PageReq, PageResList, PageResObj } from "../api";
import { EntityManager, Transaction, TransactionManager } from "typeorm";

@Service()
export class UserService {
  constructor(
    @InjectRepository()
    readonly userQueryRepo: UserQueryRepo,
  ) {}

  async findAll(param: PageReq): Promise<PageResList<User>> {
    const result = await this.userQueryRepo.findAll(param);
    return new PageResList<User>(
      result[1],
      param.limit,
      result[0].map((el: User) => {
        return el;
      }),
      "User 목록을 찾는데 성공했습니다."
    );
  }

  async findOne(id: number): Promise<PageResObj<User | {}>> {
    const result = await this.userQueryRepo.findOne("id", id);
    return new PageResObj(result, "User 조회에 성공했습니다.");
  }




  async create(paramObj: UserDto): Promise<PageResObj<User | {}>> {
    // 수량이 0일 경우 null : 무제한
    let user = await this.userQueryRepo.findOne("public_address", paramObj.public_address)

    if(user){
      user = await this.userQueryRepo.update(paramObj, "public_address", paramObj.public_address)
    }else{
      user = await this.userQueryRepo.create(paramObj);
    }
    const result: User = await this.userQueryRepo.findOne(
      "id",
      user.identifiers[0].id
    );
    return new PageResObj(result, "판매자 등록에 성공했습니다.");
  }

}
