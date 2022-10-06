import { IsOptional } from "class-validator";
import { LogClassification } from "../../enum";
import { PageReq } from "./PageReq";

export class LogListSearchReq extends PageReq {
  sort: LogClassification;
  title: string;
  buyerId: string;
  sellerId: string;

  get getSort() {
    return this.sort ? this.sort : "";
  }

  get getTitle() {
      return this.title ? this.title : "";
  }

  get getBuyerId() {
      return this.buyerId ? this.buyerId : "";
  }

  get getSellerId() {
    return this.sellerId ? this.sellerId : "";
  }
}
