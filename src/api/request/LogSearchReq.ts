import { PageReq } from "./PageReq";
import { IsString, MaxLength } from "class-validator";

export class LogSearchReq extends PageReq {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  public_address: string;
}

enum columnList {
  
}

enum columnList {
  ID = "admin_id",
  NAME = "name",
  EMAIL = "email",
  PHONE_NUMBER = "phone_number",
}

export class UserSearchReq extends PageReq {
  column: columnList;
  keyword: string;

  get getColumn() {
    return this.column ? this.column : columnList.ID;
  }

  get getKeyword() {
    return this.keyword ? this.keyword : '';
  }
}
