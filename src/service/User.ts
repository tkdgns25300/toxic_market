import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserQueryRepo } from "../repository/User";
import { User } from "../entity";
import { UserDto } from "../dto";
import { PageResList, PageResObj, UserSearchReq} from "../api";

@Service()
export class UserService {
  constructor(
    @InjectRepository()
    readonly userQueryRepo: UserQueryRepo,
  ) {}

  async findAll(param: UserSearchReq): Promise<PageResList<User>> {
    const result = await this.userQueryRepo.search(param);
    return new PageResList<User>(
      result[1],
      param.limit,
      result[0].map((el: User) => {
        return el;
      }),
      "User 목록을 찾는데 성공했습니다."
    );
  }

  async findAllSeller(param: UserSearchReq): Promise<PageResList<User>> {
    const result = await this.userQueryRepo.searchSeller(param);
    return new PageResList<User>(
      result[1],
      param.limit,
      result[0].map((el: User) => {
        return el;
      }),
      "User 목록을 찾는데 성공했습니다."
    );
  }

  async findOne(public_address: string): Promise<PageResObj<User | {}>> {
    const result = await this.userQueryRepo.findOne("public_address", public_address);
    return new PageResObj(result, "User 조회에 성공했습니다.");
  }

  async create(paramObj: UserDto): Promise<PageResObj<User | {}>> {
    let user = await this.userQueryRepo.findOne("public_address", paramObj.public_address)
    
    if(user){
      await this.userQueryRepo.update(paramObj, "public_address", paramObj.public_address)
      return new PageResObj(paramObj, "판매자 등록에 성공했습니다.");
    }
    paramObj.nonce = String(Math.floor(Math.random() * 1000000));
    user = await this.userQueryRepo.create(paramObj);
    const result: User = await this.userQueryRepo.findOne(
      "public_address",
      user.identifiers[0].public_address
    );
    return new PageResObj(result, "판매자 등록에 성공했습니다.");
  }

}
