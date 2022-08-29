import { IsInt } from "class-validator";

export class BankLogDto {
  @IsInt()
  bank_id: number;

  @IsInt()
  deposit_Amount: number;
}

export class BankLogWithdrawDto {
  @IsInt()
  bank_id: number;
}