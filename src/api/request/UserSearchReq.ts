import { PageReq } from "./PageReq";


export class UserSearchReq extends PageReq {
  name: string;
  public_address: string;

  get getName() {
    return this.name ? this.name : "";
  }

  get getAddress() {
    return this.public_address ? this.public_address : "";
  }
}