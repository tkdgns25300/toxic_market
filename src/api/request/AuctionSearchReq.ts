import { PageReq } from "./PageReq";

export class AuctionSearchReq extends PageReq {
	name: string;
	title: string;
	user_toxic_project: string;
	user_catbotica_project: string;

	get getName() {
		return this.name ? this.name : "";
	}

	get getTitle() {
		return this.title ? this.title : "";
	}

	get getUserToxicProject() {
		return this.user_toxic_project ? this.user_toxic_project : "";
	}

	get getUserCatboticaProject() {
		return this.user_catbotica_project ? this.user_catbotica_project : "";
	}
}
