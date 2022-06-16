import { Entity, Column, PrimaryColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("user")
export class User extends BaseEntity {
  @PrimaryColumn({
    type: "char",
    length: 42,
    unique: true,
    comment: "사용자 지갑 주소"
  })
  public_address: string;

  @Column({
    type: "bigint",
    comment: "kaikas 로그인 시 필요한 논스 값",
  })
  nonce: number;

  @Column({
    type: "int",
    default: 0,
    comment: "포인트 수",
  })
  point_balance: number;
}
