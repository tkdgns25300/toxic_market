import { Service } from "typedi";
import { PageResObj } from "../api";
import { imageDelete, imageUpload } from "../util/imgUpload";
import { ImageUploadDto } from "../dto";
@Service()
export class ImageUploadService {
    async upload(paramObj: ImageUploadDto[]): Promise<PageResObj<ImageUploadDto[] | {}>> {
        for (const el of paramObj) {
            if (el.img_base64) {
                el.img_url = await imageUpload(
                    el.img_base64,
                    "images"
                );
                delete el.img_base64
            }
        }
        return new PageResObj(paramObj, "사진 업로드에 성공했습니다.");
    }

    async delete(paramObj: ImageUploadDto[]) {
        for (const el of paramObj) {
            if (el.img_url) await imageDelete(el.img_url);
        }
        return new PageResObj({}, "사진 삭제에 성공했습니다.");
    }
}
