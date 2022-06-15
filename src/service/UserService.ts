import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserQueryRepo } from "../repository/UserQueryRepo";
import { User } from "../entity";
import { UserDto } from "../dto";
import { UserSearchReq, PageResList, PageResObj } from "../api";
import { imageDelete, imageUpload } from "../util/imgUpload";
import { hash } from "../util/hash";
import { EntityManager, Transaction, TransactionManager } from "typeorm";

@Service()
export class UserService {
  constructor(
    @InjectRepository()
    readonly userQueryRepo: UserQueryRepo
  ) {}

  async search(param: UserSearchReq): Promise<PageResList<User>> {
    const result = await this.userQueryRepo.search(param);
    return new PageResList<User>(
      result[1],
      param.limit,
      result[0].map((el: User) => {
        return el;
      }),
      "user 목록을 찾는데 성공했습니다"
    );
  }

  async findOne(user_id: string): Promise<PageResObj<User | {}>> {
    const result = await this.userQueryRepo.findOne(
      "user_id",
      user_id
    );
    return new PageResObj(result, "user를 찾는데 성공했습니다.");
  }
  async findByEmail(email: string): Promise<PageResObj<User | {}>> {
    const result: User = await this.userQueryRepo.findOne(
      "email",
      email
    );
    return new PageResObj(result, "user를 찾는데 성공했습니다.");
  }

  async create(paramObj: UserDto): Promise<PageResObj<User | {}>> {


    const isUnique = await this.userQueryRepo.findOne(
      "user_id",
      paramObj.user_id
    );
    if (isUnique) {
      return new PageResObj(
        paramObj,
        "이미 존재하는 운영자 아이디입니다.",
        true
      );
    }
    if (paramObj.getBase64Img()) {
      paramObj.profile_img = await imageUpload(
        paramObj.getBase64Img(),
        "profile"
      );
    }
    paramObj.password = hash(paramObj.password);

    const createResult = await this.userQueryRepo.create(
      paramObj
    );
    const result = await this.userQueryRepo.findOne(
      "user_id",
      createResult.identifiers[0].user_id
    );
    return new PageResObj(result, "user 생성에 성공했습니다.");
  }

  async update(
    paramObj: UserDto,
    id: string
  ): Promise<PageResObj<User | {}>> {
    const candidate: User = await this.userQueryRepo.findOne(
      "user_id",
      id
    );

    if (paramObj.getBase64Img()) {
      if (candidate.profile_img) await imageDelete(candidate.profile_img);
      paramObj.profile_img = await imageUpload(
        paramObj.getBase64Img(),
        "profile"
      );
    }
    if (paramObj.password) {
      paramObj.password = hash(paramObj.password);
    }
    await this.userQueryRepo.update( paramObj,
      "user_id",
      id
    );
    const result = await this.userQueryRepo.findOne(

      "user_id",
      id
    );
    return new PageResObj(result, "user 정보 수정에 성공했습니다.");
  }

  @Transaction()
  async delete(
    idArr: { id: string }[],
    @TransactionManager() manager: EntityManager
  ) {
    for (const el of idArr) {
      const candidate = await manager.findOne(User, el.id);
      if (candidate.profile_img) await imageDelete(candidate.profile_img);
      await manager.delete(User, el.id);
    }
    return new PageResObj({}, "user 삭제에 성공했습니다.");
  }
}
