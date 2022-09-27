import { PageReq } from "./PageReq";


export class checkAdminReq extends PageReq {
    admin: string;

    get getAdmin() {
        return this.admin ? this.admin : "X";
    }
}
