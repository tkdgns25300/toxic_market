import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserQueryRepo } from "../repository/User";
import { User } from "../entity";
import { PageResObj } from "../api";
import { generateAccessToken } from "../middlewares/Auth";
import { LoginDto } from "../dto";

@Service()
export class AuthService {
  constructor(
    @InjectRepository()
    readonly authQueryRepo: UserQueryRepo
  ) {}

  async login(loginDto: {
    admin_id: string;
    password: string;
    remember: boolean;
  }) {
    console.log("loginDto: ", loginDto);
    const result: User = await this.authQueryRepo.loginFindOne(
      loginDto.admin_id
    );
    if (!result)
      return new PageResObj(
        {},
        "아이디가 존재하지 않습니다. 다른 계정을 입력해주세요",
        true
      );
    if (result.password !== loginDto.password) {
      return new PageResObj({}, "비밀번호가 일치하지 않습니다.", true);
    }
    const token = generateAccessToken(result, loginDto.remember);
    return new PageResObj(
      {
        token,
      },
      "로그인에 성공했습니다."
    );
  }

  async findOne(admin_id: string): Promise<PageResObj<User | {}>> {
    // @ts-ignore
    const result: User = await this.authQueryRepo.findOne("admin_id", admin_id);
    return new PageResObj(result, "admin를 찾는데 성공했습니다.");
  }
}
