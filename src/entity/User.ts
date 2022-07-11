import { Entity, Column, PrimaryColumn } from "typeorm";
import { UserSellerType } from "../enum";
import { BaseEntity } from "./Base";

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
    type: "char",
    length: 1,
    default: "X",
    comment: "상품 판매 가능 여부"
  })
  is_seller: string;

  @Column({
    type: "varchar",
    length: 100,
    default: null,
    nullable: true,
    comment: "판매자 이메일"
  })
  email: string;

  @Column({
    type: "varchar",
    length: 30,
    default: null,
    nullable: true,
    comment: "사업자 상호명"
  })
  store_name: string;

  @Column({
    type: "varchar",
    length: 20,
    default: null,
    nullable: true,
    comment: "판매자 사업자용 연락처"
  })
  phone: string;

  @Column({
    type: "varchar",
    length: 20,
    default: null,
    nullable: true,
    comment: "판매자 이름"
  })
  name: string;

  @Column({
    type: "varchar",
    length: 300,
    default: null,
    nullable: true,
    comment: "법인 등기부등본, 본인 신분증 사본"
  })
  verify_file_url: string;

  @Column({
    type: "varchar",
    length: 100,
    default: null,
    nullable: true,
    comment: "사업자 주소지"
  })
  address: string;

  @Column({
    type: "enum",
    enum: UserSellerType,
    default: null,
    nullable: true,
    comment: "판매자 종류"
  })
  seller_type: UserSellerType;
}
