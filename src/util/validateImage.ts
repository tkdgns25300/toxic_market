import { ImageUploadDto } from "../dto";
require("dotenv").config();
const AWS = require("aws-sdk");
const isBase64 = require('is-base64');

export const isValidBase64Image = (paramObj: ImageUploadDto[]): boolean => {
  return paramObj.every(el => {
    // 확인사항
    // 1. img_base64 값이 있는지
    // 2. 빈값 '' 이 아닌지
    // 3. base64로 인코딩 된 문자인지
    return (
      el.img_base64 !== undefined &&
      el.img_base64 !== "" &&
      isBase64(el.img_base64.split(",")[1])
    );
  })
}

export const isValidURL = (paramObj: ImageUploadDto[]): boolean => {
  // AWS.config.update({
  //   region: process.env.AWS_REGION,
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // });
  // let s3 = new AWS.S3({});

  return paramObj.every(el => {
    // 확인사항
    // 1. img_url 값이 있는지
    // 2. 빈값 '' 이 아닌지
    // 3. 유효한 URL값인지
    // 4. AWS S3객체 안에 있는 이미지인지
    console.log(el)
    return (
      el.img_url !== undefined &&
      el.img_url !== '' &&
      isUrl('https://toxicmarket-image.s3.ap-northeast-2.amazonaws.com/images/20220701/1656639103345.png')
    );
  })
}

// URL형식 판별 함수
function isUrl(str: string): boolean {
  const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  return regexp.test(str);
}