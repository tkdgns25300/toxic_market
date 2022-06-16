import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserQueryRepo } from "../repository/UserQueryRepo";
import { User } from "../entity";
import {  PageResObj } from "../api";


@Service()
export class UserService {
    constructor(
        @InjectRepository()
        readonly userQueryRepo: UserQueryRepo
    ) {}

    async findOne(public_address: string): Promise<PageResObj<User | {}>> {
        const result = await this.userQueryRepo.findOne(
            "public_address",
            public_address
        );
        return new PageResObj(result, "user를 찾는데 성공했습니다.");
    }

}
