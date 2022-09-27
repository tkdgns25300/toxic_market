import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class ExchangeLogDto {
  id: number;

  @IsString({ message: "문자열이 아닙니다." })
  user_type: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(1, { message: "최대 1자까지 입력됩니다." })
  user_toxic_project: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(1, { message: "최대 1자까지 입력됩니다." })
  user_catbotica_project: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(20, { message: "최대 20자까지 입력됩니다." })
  user_id: string;

  @IsInt()
  @IsOptional()
  exchange_point: number;

  @IsInt()
  @IsOptional()
  exchange_coin: number;

  @IsInt()
  commission: number;

  @IsInt()
  @IsOptional()
  return_commission: number;
}