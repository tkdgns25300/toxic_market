import { ImageUploadDto } from "../dto/market";
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

export const isValidURL = async (paramObj: ImageUploadDto[]): Promise<boolean> => {
    // 확인사항
    // 1. img_url 값이 있는지
    // 2. 빈값 '' 이 아닌지
    // 3. 유효한 URL값인지
    // 4. AWS S3객체 안에 있는 이미지인지
  for (const el of paramObj) {
    if (
      el.img_url === undefined ||
      el.img_url === '' ||
      !isUrl(el.img_url) ||
      !await isExist(el.img_url)
    ) {
      return false;
    }
  }
  return true;
}

// URL형식 판별 함수
function isUrl(str: string): boolean {
  const regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(str);
}

// S3내에 파일 존재 확인 함수
async function isExist(url: string): Promise<boolean> {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: url.split("s3.ap-northeast-2.amazonaws.com/")[1]
  }
  const s3 = new AWS.S3(params);

  try {
    await s3.headObject(params).promise();
    return true;
  } catch (error) {
      return false;
  }
}
