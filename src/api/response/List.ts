import {
  IsString,
  IsArray,
} from "class-validator";

export class List<T> {
  @IsString()
  msg: string;
  @IsArray()
  items: T[];
  error: boolean;
  constructor(
    items: T[],
    msg: string,
    error: boolean = false
  ) {
    this.error = error;
    this.msg = msg;
    this.items = items;
  }
}
