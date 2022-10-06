import { IsOptional } from "class-validator";
import { LogClassification } from "../../enum";
import { PageReq } from "./PageReq";

export class LogListSearchReq extends PageReq {
  sort: LogClassification;
  name: string;
  title: string;

  get getSort() {
    return this.sort ? this.sort : "";
  }
  
  get getName() {
      return this.name ? this.name : "";
  }

  get getTitle() {
      return this.title ? this.title : "";
  }
}
