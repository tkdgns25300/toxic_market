import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UserDto {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  public_address: string;

  @IsNumber()
  nonce: string;

  @IsInt()
  @IsOptional()
  CF_balance: number;

  @IsBoolean({ message: "불린값이 아닙니다."})
  @IsOptional()
  isSeller: boolean;
}
