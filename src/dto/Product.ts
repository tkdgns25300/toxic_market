import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class ProductDto {
  id: number;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
  @IsOptional()
  main_img_url: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  sub_img_url: string;

  @IsInt()
  @IsOptional()
  price: number;

  @IsOptional()
  amount: number | string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(50, { message: "최대 50자까지 입력됩니다." })
  @IsOptional()
  title: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  description: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
  @IsOptional()
  contact: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  @IsOptional()
  user_address: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(1, { message: "최대 1자까지 입력됩니다." })
  @IsOptional()
  is_visible: string;
}
