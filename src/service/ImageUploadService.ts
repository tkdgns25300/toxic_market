import { Service } from "typedi";
import { PageResObj } from "../api";
import { imageDelete, imageUpload } from "../util/imgUpload";
import { ImageUploadDto } from "../dto";
@Service()
export class ImageUploadService {
  // 업로드 되는 규칙(여러 이미지, 여러 파일에 대해서 비동기적으로 처리가 되어야 할 때 프론트와 백엔드의 처리 방식이 동일하지 않으면 S3 버킷에 레거시 파일 형태로 계속 남게 될 수 있다.)
  async upload(
    paramObj: ImageUploadDto[]
  ): Promise<PageResObj<ImageUploadDto[] | {}>> {
    // for문보다는 forEach문
    for (const el of paramObj) {
      // 업로드 에러 시나리오 부족

      // 에러 캐칭을 해주어야 함
      if (el.img_base64) {
        el.img_url = await imageUpload(el.img_base64, "images");
        delete el.img_base64;
      }
    }
    return new PageResObj(paramObj, "사진 업로드에 성공했습니다.");
  }

  async delete(paramObj: ImageUploadDto[]) {
    // 순서
    // 삭제될 파일이 실존하는지 먼저 확인이 필요한가?
    // s3 -> error를 리턴하는지, 아니면 컨트롤 가능한 형태의 데이터를 리턴하는지
    // RDS 먼저 확인을 하거나 삭제요청을 보내고 콜백된 데이터로 판별이 가능
    for (const el of paramObj) {
      if (el.img_url) await imageDelete(el.img_url);
    }
    // Promise.allSettled()
    return new PageResObj({}, "사진 삭제에 성공했습니다.");
  }
}
