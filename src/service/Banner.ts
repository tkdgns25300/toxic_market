import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { PageResList, PageResObj } from "../api";
import { BannerDto } from "../dto/Banner";
import { Banner } from "../entity";
import { BannerQueryRepo } from "../repository/Banner";
import { ImageUploadService } from "./ImageUpload";

@Service()
export class BannerService {
  constructor(
    @InjectRepository()
    readonly bannerQueryRepo: BannerQueryRepo,
    readonly imageUploadService: ImageUploadService
  ) {}

  async create(paramObj: BannerDto) {
    const exist = await this.bannerQueryRepo.findOne("is_vertical", paramObj.is_vertical); // 요청이 들어온 세로/가로와 동일한 위치에 배너가 있는 지 여부 확인
    if(exist) {
      await this.bannerQueryRepo.delete("id", exist.id);
      //const deleteImg = new ImageUploadDto(); 기존에 is_vertical과 동일하 배너가 있을 경우, 삭제하고 추가한다
      //deleteImg.img_url = exist.img_url;      s3에서도 삭제하기 위해 로직 추가
      //await this.imageUploadService.delete([deleteImg]);
    }

    const banner = await this.bannerQueryRepo.create(paramObj); // 기존에 있는 배너를 삭제하고 새로운 배너를 만든다
    const result = await this.bannerQueryRepo.findOne("id", banner.identifiers[0].id); // 만든 걸 리턴함
    
    return new PageResObj(result, "Product 생성에 성공했습니다.");
  }

  async findAll(): Promise<PageResList<Banner>> {
    const result = await this.bannerQueryRepo.findAll()
    console.log(result)
    return new PageResList<Banner>(
      result[1],
      1, // return 타입 맞추기 위해서 totalPage를 넣어줬는데 이렇게 진행해도 되는 지 의문입니다.
      result[0].map((el: Banner) => {
        return el;
      }),
      "Banner 목록을 찾는데 성공했습니다."
    )
  }
}
