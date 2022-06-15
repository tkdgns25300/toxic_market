import {
  IsInt,
  IsDate,
  Min,
  Max,
  IsString,
  IsObject,
  ValidateNested,
  Allow,
  IsNotEmpty,
  IsArray,
  ArrayContains,
} from "class-validator";
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
    this.msg = msg;
    this.items = items;
  }
}
