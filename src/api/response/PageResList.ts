import { IsInt, IsString, IsArray } from "class-validator";

export class PageResList<T> {
  // pageSize: number;
  @IsInt()
  totalCount: number;
  @IsInt()
  totalPage: number;
  @IsString()
  msg: string;
  @IsArray()
  items: T[];
  error: boolean;
  constructor(
    totalCount: number,
    pageSize: number,
    items: T[],
    msg: string,
    error: boolean = false
  ) {
    // this.pageSize = pageSize;
    this.error = error;
    this.totalCount = totalCount;
    this.totalPage = Math.ceil(totalCount / pageSize) | 0;
    // Math.ceil() 함수는 주어진 숫자보다 크거나 같은 숫자 중 가장 작은 숫자를 integer 로 반환함
    // => Math.ceil함으로써 totalCount / pageSize가 숫자가 아닐 경우애는 0이 리턴된다.
    this.msg = msg;
    this.items = items;
  }
}
