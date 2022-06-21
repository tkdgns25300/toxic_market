import { PageReq } from "./PageReq";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class LogSearchReq extends PageReq {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  @IsOptional()
  seller: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  @IsOptional()
  buyer: string;

  get getUser() {
    return this.seller ? 'seller' : 'buyer';
  }
}
