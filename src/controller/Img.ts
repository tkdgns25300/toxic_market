import {
  Body,
  Delete,
  JsonController,
  Post,
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
@JsonController("/market/image")
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
}
