import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from "typeorm";
import { UserType } from "../enum";
import { BaseEntity } from "./Base";
import { User } from "./User";

@Entity("exchange_log")
export class ExchangeLog extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "환전기록 아이디",
  })
  id: number;

  @Column({
    type: "enum",
    enum: UserType,
    comment: "사용자 타입"
  })
  user_type: UserType;

  @Column({
    type: "varchar",
    length: 20,
    default: null,
    nullable: true,
    comment: "사용자 아이디"
  })
  user_id: string;

  @Column({
    type: "int",
    default: null,
    nullable: true,
    comment: "환전 포인트"
  })
  exchange_point: number;

  @Column({
    type: "int",
    default: null,
    nullable: true,
    comment: "환전 코인"
  })
  exchange_coin: number;

  @Column({
    type: "int",
    comment: "수수료"
  })
  commission: number;

  @Column({
    type: "int",
    default: 0,
    comment: "수수료"
  })
  return_commission: number;

  @ManyToOne(() => User, (user) => user.public_address, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "creator_address" })
  creator: string;
}
