import { PageReq } from "./PageReq";


export class AuctionSearchReq extends PageReq {
    name: string;
    title: string;

    get getName() {
        return this.name ? this.name : "";
    }

    get getTitle() {
        return this.title ? this.title : "";
    }
}
