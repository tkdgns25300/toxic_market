import { Service } from "typedi";
import { PageResObj } from "../api";
import { imageDelete, imageUpload } from "../util/imgUpload";
import { ImageUploadDto } from "../dto";
import { isValidBase64Image, isValidURL } from "../util/validateImage";

@Service()
export class ImageUploadService {
  async upload(paramObj: ImageUploadDto[]): Promise<PageResObj<ImageUploadDto[] | {}>> {
    // 각 요소들 validate: 하나라도 유효하지 않을 경우 Error
    if (!isValidBase64Image(paramObj)) {
      return new PageResObj({}, "유효한 Base64 이미지 값을 입력해주세요.", true);
    }
    // 이미지 업로드
    const result = await Promise.all(
      paramObj.map(async (el) => {
        return { img_url: await imageUpload(el.img_base64, "images") };
      })
    );
    return new PageResObj(result, "사진 업로드에 성공했습니다.");
  }

  async delete(paramObj: ImageUploadDto[]) {
    // 각 요소들 validate: 하나라도 유효하지 않을 경우 Error
    if (!await isValidURL(paramObj)) {
      return new PageResObj({}, "유효한 URL값을 입력해주세요.", true);
    }
    // 이미지 삭제
    await Promise.all(
      paramObj.map(async (el) => {
        return imageDelete(el.img_url)
      })
    )
    return new PageResObj({}, "사진 삭제에 성공했습니다.");
  }
}
