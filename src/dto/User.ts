import {
  IsEmail,
  MinLength,
  IsEmpty, // null을 허용함
  IsJWT,
  IsString,
  IsNotEmpty, // null을 허용 안함
  MaxLength,
  NotContains,
  IsOptional,
  IsBoolean,
  IsDate,
} from "class-validator";

export class UserDto {
  @IsOptional()
  @MaxLength(40, { message: "최대 40자까지 입력됩니다." })
  @IsString({ message: "문자열이 아닙니다." })
  user_id: string;

  @IsOptional()
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(129, { message: "최대 100자까지 입력됩니다." })
  password: string;

  @IsOptional()
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(40, { message: "최대 40자까지 입력됩니다." })
  name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(30, { message: "최대 30자까지 입력됩니다." })
  email: string;

  @IsOptional()
  @MaxLength(30, { message: "최대 30자까지 입력됩니다." })
  @NotContains("-", { message: "- 기호를 제거해주세요" })
  phone_number?: string | null;

  @IsDate()
  @IsOptional()
  last_login: Date;

  @IsOptional()
  @IsBoolean({ message: "boolean타입이 아닙니다." })
  is_super: boolean;

  @IsOptional()
  @IsString()
  profile_img?: string | null;

  @IsOptional()
  @IsString()
  profile_img_base64?: string | null;

  @IsOptional()
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(200, { message: "최대 200자까지 입력됩니다." })
  self_introduction: string;

  created_at?: Date | null;

  getBase64Img() {
    return this.profile_img_base64 ? this.profile_img_base64 : null;
  }

  // getUpdateData() {
  //   return {
  //     name: this.name,
  //     password: this.password,
  //     profile_img: this.profile_img,
  //     phone_number: this.phone_number,
  //     email: this.email,
  //     is_super: this.is_super,
  //   };
  // }
}

