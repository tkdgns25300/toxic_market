import {
  Column, Entity, PrimaryGeneratedColumn
} from "typeorm";
import { BaseEntity } from "./Base";

@Entity("banner")
export class Banner extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "배너 아이디",
  })
  id: number;

  @Column({
    type: "varchar",
    length: 200,
    comment: "배너 이미지 주소",
  })
  img_url: string;

  @Column({
    type: "varchar",
    length: 200,
    comment: "광고 링크",
  })
  link: string;

  @Column({
    type: "char",
    length: 1,
    default: "O",
    comment: "세로 판단 여부",
  })
  is_vertical: string;
}
