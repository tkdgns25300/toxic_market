import { IsInt } from "class-validator";

export class ExchangeDto {
  @IsInt()
  amount: number;
}
