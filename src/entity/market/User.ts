import { Entity, Column, PrimaryColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("user")
export class User extends BaseEntity {
  @PrimaryColumn({
    type: "char",
    length: 42,
    comment: "사용자 지갑 주소",
  })
  public_address: string;

  @Column({
    type: "char",
    length: 6,
    comment: "kaikas 로그인 시 필요한 논스 값",
  })
  nonce: string;

  @Column({
    type: "int",
    default: 0,
    comment: "보유 CF",
  })
  CF_balance: number;

  @Column({
    type: "boolean",
    default: false,
    comment: "상품 판매 가능 여부"
  })
  isSeller: boolean;
}
