import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "./Base";

@Entity("product")
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "상품 아이디",
  })
  id: number;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
    comment: "대표 이미지 주소",
  })
  main_img_url: string;

  @Column({
    type: "text",
    nullable: true,
    comment: "서브 이미지 주소",
  })
  sub_img_url: string;

  @Column({
    type: "int",
    comment: "상품 가격",
  })
  price: number;

  @Column({
    type: "int",
    nullable: true,
    comment: "등록 수량",
  })
  amount: number;

  @Column({
    type: "varchar",
    length: 50,
    comment: "상품명",
  })
  title: string;

  @Column({
    type: "text",
    comment: "상품 설명",
  })
  description: string;

  @Column({
    type: "varchar",
    comment: "판매자 연락 링크",
  })
  contact: string;

  @CreateDateColumn({
    comment: "생성 시간",
  })
  created_at: Date;

  @Column({
    type: "char",
    length: 42,
    comment: "사용자 아이디",
  })
  user_address: string;

  @Column({
    type: "boolean",
    default: true,
    comment: "상품 조회 가능 여부"
  })
  isVisible: boolean;
}
