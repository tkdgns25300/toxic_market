import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class AuctionDto {
  id: number;


  @IsInt()
  price: number;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(50, { message: "최대 50자까지 입력됩니다." })
  title: string;

  @IsString({ message: "문자열이 아닙니다." })
  description: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
  contact: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
  main_img_url: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  sub_img_url: string;


  @IsBoolean()
  is_approved: boolean;

  @IsBoolean()
  is_succeed: boolean;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  @IsOptional()
  bidder: string;

  @IsInt()
  bid: number;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  @IsOptional()
  creator: string;

}
