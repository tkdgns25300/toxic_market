import { IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { User } from "../entity";

export class ProductDto {
    id: number;

    @IsString({ message: "문자열이 아닙니다." })
    @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
    main_img_url: string;

    @IsString({ message: "문자열이 아닙니다." })
    @IsOptional()
    sub_img_url: string;

    @IsNumber()
    price: number;

    @IsNumber()
    amount: number;

    @IsString({ message: "문자열이 아닙니다." })
    @MaxLength(50, { message: "최대 50자까지 입력됩니다." })
    title: string;

    @IsString({ message: "문자열이 아닙니다." })
    description: string;

    @ValidateNested()
    user: User;
}