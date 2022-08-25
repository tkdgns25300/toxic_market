import { Type } from "class-transformer";
import { IsDate, IsInt, IsString, MaxLength } from "class-validator";

export class BankLogDto {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  depositor: string;

  @IsInt()
  bank_id: Date;

  @IsInt()
  deposite_Amount: number;

  @IsDate()
  @Type(() => Date)
  entry_at: Date;
}