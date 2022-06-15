import {IsBoolean, IsJWT, IsNumber, IsString, MaxLength} from "class-validator";
import { User } from "../entity";

export class ProductDto {
    id: number;

    @IsString({ message: "문자열이 아닙니다." })
    @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
    main_img_url: string;

    @IsString({ message: "문자열이 아닙니다." })
    sub_img_url: string;

    @IsNumber()
    price: number;

    @IsNumber()
    amount: number;

    @IsString({ message: "문자열이 아닙니다." })
    title: string;

    @IsString({ message: "문자열이 아닙니다." })
    description: string;

    @IsString({ message: "문자열이 아닙니다." })
    created_at: Date;

    @IsBoolean()
    user: User
}