import { PageReq } from "./PageReq";

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
