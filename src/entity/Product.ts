import { Entity, Column, CreateDateColumn, PrimaryColumn } from "typeorm";
import { IsDate, IsString, IsEmail, IsBoolean, IsUrl } from "class-validator";
import { BaseEntity } from "./BaseEntity";

@Entity("product")
export class Product extends BaseEntity {
  @IsString()
  @PrimaryColumn({
    type: "varchar",
    length: "40",
    unique: true,
    comment: "관리자 아이디",
  })
  user_id: string;

  @IsString()
  @Column({
    type: "varchar",
    length: 129,
    comment: "관리자 패스워드",
    select: false,
  })
  password: string;

  @IsString()
  @Column({ type: "varchar", length: 40, comment: "관리자 이름" })
  name: string;

  @IsEmail()
  @Column({
    type: "varchar",
    length: 30,
    default: null,
    nullable: true,
    unique: true,
    comment: "관리자 이메일",
  })
  email: string;

  @IsString()
  @Column({
    type: "varchar",
    length: 30,
    default: null,
    nullable: true,
    unique: true,
    comment: "관리자 연락처",
  })
  phone_number: string;

  @IsDate()
  @Column({
    type: "datetime",
    default: null,
    nullable: true,
    comment: "최근 접속 일시",
  })
  last_login: Date;

  @IsBoolean()
  @Column({
    type: "boolean",
    default: false,
    comment: "super관리자인 경우 true",
  })
  is_super: Boolean;

  @IsUrl()
  @Column({
    type: "varchar",
    length: 150,
    default: null,
    nullable: true,
    comment: "괸라자 이미지 src",
  })
  profile_img: string;

  @IsDate()
  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: "varchar",
    length: "200",
    default: null,
    nullable: true,
    comment: "소개",
  })
  self_introduction: string;
}
