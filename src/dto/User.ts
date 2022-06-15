import { IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class UserDto {
    @IsString({ message: "문자열이 아닙니다." })
    @MaxLength(50, { message: "최대 50자까지 입력됩니다." })
    user_name: string;

    @IsString({ message: "문자열이 아닙니다." })
    @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
    password: string;

    @IsString({ message: "문자열이 아닙니다." })
    @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
    public_address: string;

    @IsNumber()
    nonce: number;

    @IsNumber()
    @IsOptional()
    point_balance: number;
}
