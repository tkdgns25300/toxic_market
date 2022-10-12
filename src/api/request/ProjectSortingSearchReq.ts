import { PageReq } from "./PageReq";

export class ProjectSortingSearchReq extends PageReq {
  user_toxic_project: string;
  user_catbotica_project: string;

  get getUserToxicProject() {
    return this.user_toxic_project ? this.user_toxic_project : "";
  }

  get getUserCatboticaProject() {
    return this.user_catbotica_project ? this.user_catbotica_project : "";
  }
}
