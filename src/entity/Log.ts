import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("log")
export class Log extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "로그 아이디"
  })
  id: number;

  @Column({
    type: "varchar",
    length: 50,
    comment: "상품명",
  })
  title: string;

  @Column({
    type: "int",
    comment: "구매(판매) CF"
  })
  total_CF: number;

  @Column({
    type: "int",
    comment: "구매(판매) 수량"
  })
  amount: number;

  @Column({
    type: "varchar",
    comment: "판매자 연락 링크",
  })
  contact: string;

  @CreateDateColumn({
    comment: "구매(판매) 일자"
  })
  created_at: Date;

  @Column({
    type: "char",
    length: 42,
    comment: "판매자 지갑 주소"
  })
  seller: string;

  @Column({
    type: "char",
    length: 42,
    comment: "구매자 지갑 주소"
  })
  buyer: string;
}
