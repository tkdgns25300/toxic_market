import { IsBoolean, IsString, MaxLength } from "class-validator";

export class BannerDto {
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
  img_url: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
  link: string;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(1, { message: "최대 1자까지 입력됩니다." })
  is_vertical: string;
}
