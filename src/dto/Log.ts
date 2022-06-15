import { IsBoolean, IsNumber, IsString, MaxLength, ValidateNested } from "class-validator";
import { User } from "../entity";

export class LogDto {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  public_address: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(50, { message: "최대 50자까지 입력됩니다." })
  title: string;

  @IsNumber()
  total_point: number;

  @IsNumber()
  amount: number;

  @IsBoolean()
  is_sale: boolean;

  @ValidateNested()
  user: User;
}