import { PageReq } from "./PageReq";
import { IsString, MaxLength } from "class-validator";

export class LogSearchReq extends PageReq {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  public_address: string;
}