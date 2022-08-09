import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserQueryRepo } from "../repository/User";
import { User } from "../entity";
import { UserDto } from "../dto";
import { PageResList, PageResObj, UserSearchReq} from "../api";
import { UserIdPasswordDto } from "../dto/User";
import { hash } from "../util/hash";

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
    if (paramObj.store_name === '') {
      delete paramObj.store_name
    }
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

  async register(paramObj: UserIdPasswordDto, public_address: string): Promise<PageResObj<{}>> {
    const user = await this.userQueryRepo.findOne("public_address", public_address)
    // 이미 ID를 등록했었던 경우
    if (user.id !== null) {
      return new PageResObj({}, "이미 ID가 등록되어 있습니다.", true);
    }
    // ID 등록
    const updatedUser = await this.userQueryRepo.update({
      id: paramObj.id,
      passwordHash: hash(paramObj.password)      
    }, "public_address", public_address)
    if (updatedUser.affected !== 1) {
      return new PageResObj({}, "ID등록에 실패하였습니다.", true);
    }
    return new PageResObj({}, "ID등록에 성공하였습니다.");
  }
}
