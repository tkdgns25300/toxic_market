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
    /**
     * TODO
     * 삭제될 파일이 실존하는지 먼저 확인이 필요한가?
     * s3 -> error를 리턴하는지, 아니면 컨트롤 가능한 형태의 데이터를 리턴하는지
     * RDS 먼저 확인을 하거나 삭제요청을 보내고 콜백된 데이터로 판별이 가능
     * delete 에서는 각 요소들 validate이후 Promise.all이용해 삭제 -> validate나 promise.all 하나라도 Error나면 PageResObj Error 리턴
     * 추가로 s3.deleteObject의 - bucketName과 - key값에 이상한 값 넣어서 어떤 데이터(에러)가 리턴되는지 확인
    */

    // 각 요소들 validate: 하나라도 유효하지 않을 경우 Error
    if (!isValidURL(paramObj)) {
      return new PageResObj({}, "유효한 URL값을 입력해주세요.", true);
    }
    console.log(isValidURL)

    // paramObj.forEach(async (el) => {
    //   if (el.img_url) await imageDelete(el.img_url);
    // })
    return new PageResObj({ isValidURL }, "사진 삭제에 성공했습니다.");
  }
}
