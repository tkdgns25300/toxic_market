import { IsInt } from "class-validator";
export class BidDto {

  @IsInt()
  bid_amount: number;

  @IsInt()
  auction_id: number;
}
