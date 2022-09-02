import { IsInt } from "class-validator";

export class StakingLogDto {
  id: number;

  @IsInt()
  payment_amount: number;
}
