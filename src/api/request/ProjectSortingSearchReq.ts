import { PageReq } from "./PageReq";

export class ProjectSortingSearchReq extends PageReq {
  id: string;
  public_address: string;
  user_toxic_project: string;
  user_catbotica_project: string;

  get getId() {
    return this.id ? this.id : "";
  }

  get getAddress() {
    return this.public_address ? this.public_address : "";
  }

  get getUserToxicProject() {
    return this.user_toxic_project ? this.user_toxic_project : "";
  }

  get getUserCatboticaProject() {
    return this.user_catbotica_project ? this.user_catbotica_project : "";
  }
}
