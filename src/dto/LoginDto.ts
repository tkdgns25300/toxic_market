import {IsBoolean, IsJWT, IsString, MaxLength} from "class-validator";
import {hash} from "../util/hash";

export class LoginDto {
    @IsString({ message: "문자열이 아닙니다." })
    @MaxLength(30, { message: "최대 30자까지 입력됩니다." })
    admin_id: string;

    @IsString({ message: "문자열이 아닙니다." })
    password: string;

    @IsBoolean()
    remember: boolean;

    getHashAdminInfo() {
        return {
            admin_id: this.admin_id,
            password: hash(this.password),
            remember: this.remember
        };
    }
}

export class SuccessLoginRes {
    @IsJWT()
    token: string;
}
