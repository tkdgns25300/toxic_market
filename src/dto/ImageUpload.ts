import { IsOptional, IsString, MaxLength } from "class-validator";

export class ImageUploadDto {
  @IsOptional()
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(250, { message: "최대 250자까지 입력됩니다." })
  img_url: string;

  @IsOptional()
  @IsString({ message: "문자열이 아닙니다." })
  img_base64: string;
}
