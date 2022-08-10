import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { UserSellerType } from "../enum";

export class UserDto {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  public_address: string;

  @IsNumber()
  nonce: string;

  @IsInt()
  @IsOptional()
  CF_balance: number;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(1, { message: "최대 1자까지 입력됩니다." })
  @IsOptional()
  is_seller: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(1, { message: "최대 1자까지 입력됩니다." })
  @IsOptional()
  is_admin: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(100, { message: "최대 100자까지 입력됩니다." })
  @IsOptional()
  email: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(30, { message: "최대 30자까지 입력됩니다." })
  @IsOptional()
  store_name: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(20, { message: "최대 20자까지 입력됩니다." })
  @IsOptional()
  phone: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(20, { message: "최대 20자까지 입력됩니다." })
  @IsOptional()
  name: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(300, { message: "최대 300자까지 입력됩니다." })
  @IsOptional()
  verify_file_url: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(100, { message: "최대 100자까지 입력됩니다." })
  @IsOptional()
  address: string;

  @IsOptional()
  seller_type: UserSellerType;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(20, { message: "최대 20자까지 입력됩니다." })
  @IsOptional()
  id: string

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(100, { message: "최대 100자까지 입력됩니다." })
  @IsOptional()
  passwordHash: string

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(1, { message: "최대 1자까지 입력됩니다." })
  @IsOptional()
  agreeRaffleService: string;
}

export class UserIdPasswordDto {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(20, { message: "최대 20자까지 입력됩니다." })
  id: string

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(100, { message: "최대 100자까지 입력됩니다." })
  password: string
}

export class UserPasswordDto {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(100, { message: "최대 100자까지 입력됩니다." })
  password: string
}