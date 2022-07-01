import { ImageUploadDto } from "../dto";
const isBase64 = require('is-base64');

export const isValidBase64Image = (paramObj: ImageUploadDto[]): boolean => {
  return paramObj.every(el => {
    // 확인사항
    // 1. img_base64 값이 있는지
    // 2. 빈값 '' 이 아닌지
    // 3. base64로 인코딩 된 문자인지
    return el.img_base64 !== undefined && el.img_base64 !== "" && isBase64(el.img_base64.split(",")[1]);
  })
}