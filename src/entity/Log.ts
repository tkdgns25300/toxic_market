import { Entity, Column, CreateDateColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

@Entity("log")
export class Log extends BaseEntity {
  @PrimaryColumn({
    type: "char",
    length: 42,
    comment: "사용자 지갑 주소"
  })
  public_address: string;

  @Column({
    type: "varchar",
    length: 50,
    comment: "상품명",
  })
  title: string;

  @Column({
    type: "int",
    comment: "구매(판매) 포인트"
  })
  total_point: number;

  @Column({
    type: "int",
    comment: "구매(판매) 수량"
  })
  amount: number;

  @CreateDateColumn({
    comment: "구매(판매) 일자"
  })
  created_at: Date;

  @Column({
    type: "bool",
    comment: "구매/판매 로그 구분",
  })
  is_sale: boolean;

  @ManyToOne(
    () => User,
    user => user.public_address
  )
  user: string
}
