import { IsInt, IsString } from "class-validator";

export class BankDto {
  @IsString({ message: "문자열이 아닙니다." })
  start_at: string;

  @IsString({ message: "문자열이 아닙니다." })
  end_at: string;

  @IsInt()
  daily_Interest: number;

  @IsInt()
  total_Interest: number;

  @IsInt()
  deposit_Total: number;

  @IsInt()
  remaing_Day: number;
}