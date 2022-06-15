import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

@Entity("product")
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "상품 아이디"
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
    comment: "서브 이미지 주소"
  })
  sub_img_url: string;

  @Column({
    type: "int",
    comment: "상품 가격",
  })
  price: number;

  @Column({
    type: "int",
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

  @CreateDateColumn({
    comment: "생성 시간"
  })
  created_at: Date;

  @ManyToOne(
    () => User,
    user => user.public_address
  )
  user: User
}
