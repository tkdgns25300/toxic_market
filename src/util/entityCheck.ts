import { createQueryBuilder} from "typeorm";
import { getConnection } from "typeorm";

import {User} from "../entity";

import {hash} from "./hash";

export class checkEntityExist {
  constructor() {}

    async checkAdmin() {
        const is_exist = await createQueryBuilder()
            .select("admin")
            .from(User, "admin")
            .getManyAndCount();

        if (is_exist[1] === 0) {
            let hashedPassword = hash('123');
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    user_id: 'wiki',
                    password: hashedPassword,
                    name: 'test',
                    created_at: new Date()
                })
                .execute();
        }
    }
}
