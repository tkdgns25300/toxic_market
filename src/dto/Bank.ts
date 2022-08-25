import { Type } from "class-transformer";
import { IsDate, IsInt } from "class-validator";

export class BankDto {
  @IsDate()
  @Type(() => Date)
  start_at: Date;

  @IsDate()
  @Type(() => Date)
  end_at: Date;

  @IsInt()
  daily_Interest: number;

  @IsInt()
  total_Interest: number;

  @IsInt()
  deposit_Total: number;
}