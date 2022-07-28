import { Type } from "class-transformer";
import { IsDate, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class RaffleDto {
  id: number;

  @IsInt()
  price: number;

  @IsInt()
  amount: number;

  @IsDate()
  @Type(() => Date)
  start_at: Date;

  @IsDate()
  @Type(() => Date)
  end_at: Date;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(50, { message: "최대 50자까지 입력됩니다." })
  title: string;

  @IsString({ message: "문자열이 아닙니다." })
  description: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
  contact: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  @IsOptional()
  creator_address: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
  main_img_url: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  sub_img_url: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  is_approved: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  is_succeed: string;
}