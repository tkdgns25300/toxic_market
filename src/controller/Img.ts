import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  QueryParams,
  Res,
  UseBefore,
} from "routing-controllers";
import { Response } from "express";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { ImageUploadDto } from "../dto";
import { PageResObj } from "../api";
import { checkAccessToken } from "../middlewares/Auth";
import { ImageUploadService } from "../service/ImageUpload";
@Service()
@JsonController("/image")
export class ImageUploadCtrl {
  @Inject()
  imageUploadService: ImageUploadService;
  @Post("/upload")
  @UseBefore(checkAccessToken)
  public async upload(
    @Body({ options: { limit: "20mb" } }) createDto: ImageUploadDto[],
    @Res() res: Response
  ) {
    try {
      return await this.imageUploadService.upload(createDto);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
  @Delete("/delete")
  @UseBefore(checkAccessToken)
  public async delete(@Body() urlArr: ImageUploadDto[], @Res() res: Response) {
    try {
      return await this.imageUploadService.delete(urlArr);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/aws")
  public async AWSBucketUpdate(@QueryParams() param) {
    const fs = require('fs');

    /* 폴더 접근 */
    const fileArray = await fs.readdirSync(`/Users/hansanghun/Desktop/AWS/NFTimages`);
    let totalJsonChange = 0;
    for (const file of fileArray) {
      const splitExtension = file.split('.')
      const number = splitExtension[splitExtension.length - 2];
      const extension = splitExtension[splitExtension.length-1];
      if (extension === 'json') {
        let jsonData = await fs.readFileSync(`/Users/hansanghun/Desktop/AWS/NFTimages/${file}`, "utf8");
        const jsonObjectData = JSON.parse(jsonData);
        jsonObjectData.image = `https://magicclub-revealed-image.s3.ap-northeast-2.amazonaws.com/NFTimages/${number}.png`
        jsonData = JSON.stringify(jsonObjectData);
        await fs.writeFileSync(`/Users/hansanghun/Desktop/AWS/NFTimages/${file}`, jsonData)
        totalJsonChange++;
      }
    }
    console.log(totalJsonChange)
    

    /*
    // /* 랜덤 넘버 생성 */
    // async function generateRandomNumber() {
    //   const allNumberString = await fs.readFileSync("randomNumber.txt", {encoding:'utf8', flag:'r'})
    //   const allNumber = allNumberString.split(",")
    //   const randomIndex = Math.floor(Math.random() * allNumber.length);
    //   const randomNumber = allNumber[randomIndex];
    //   const newAllNumber = allNumber.filter(e => e !== randomNumber);
    //   await fs.writeFileSync("randomNumber.txt", newAllNumber + "");
    //   return randomNumber;
    // }
   

    // /* 폴더 접근 */
    // let listArray = await fs.readdirSync(`/Users/hansanghun/Desktop/AWS/${param.rarity}/${param.directoryName}`);

    // /**
    //  * image파일 수정(이름)
    //  * JSON파일 수정(이름, #넘버, Rarity)
    //  */
    // console.log(listArray)
    // listArray = listArray.filter(e => e !== '.DS_Store')
    // listArray.sort()
    // console.log(listArray)
    // const imageArray = await fs.readdirSync(`/Users/hansanghun/Desktop/AWS/${param.rarity}/${param.directoryName}/${listArray[0]}`);
    // const jsonArray = await fs.readdirSync(`/Users/hansanghun/Desktop/AWS/${param.rarity}/${param.directoryName}/${listArray[1]}`);
    // for (const image of imageArray) {
    //   const originalNum = image.split('.')[0];
    //   if (originalNum !== '') {
    //     const originalImageName = originalNum + '.png';
    //     const originalJsoneName = originalNum + '.json';
    //     const ranNum = await generateRandomNumber();
    //     const imageName = ranNum + '.png';
    //     const jsonName = ranNum + '.json';
        
    //     // 이미지 수정
    //     const imageData = await fs.readFileSync(`/Users/hansanghun/Desktop/AWS/${param.rarity}/${param.directoryName}/images/${originalImageName}`);
    //     await fs.writeFileSync(`/Users/hansanghun/Desktop/AWS/NFTimages/${imageName}`, imageData);
        
    //     // JSON 수정
    //     let jsonData = await fs.readFileSync(`/Users/hansanghun/Desktop/AWS/${param.rarity}/${param.directoryName}/metadata/${originalJsoneName}`, "utf8")
    //     const jsonObjectData = JSON.parse(jsonData);
    //     jsonObjectData.name = `Magic Club #${ranNum}`;
    //     jsonObjectData.description = `Magic Club #${ranNum} - Created by Magic Club`;
    //     jsonObjectData.Rarity = `${param.rarity}`;
    //     jsonData = JSON.stringify(jsonObjectData);
    //     await fs.writeFileSync(`/Users/hansanghun/Desktop/AWS/NFTimages/${jsonName}`, jsonData)
    //   }
    // }



    // const allNumberString = await fs.readFileSync("randomNumber.txt", {encoding:'utf8', flag:'r'})
    // const allNumber = allNumberString.split(",")
    // console.log(allNumber.length)


    // const data = []
    // for (let i = 1; i <= 10000; i++) {
    //   data.push(i);
    // }
    // let temp = "" + data;
    // fs.writeFileSync("randomNumber.txt", temp)
    
    return new PageResObj({}, "good");
  }
}
