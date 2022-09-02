import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./Base";
import { User } from "./User";

@Entity("staking")
export class Staking extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "스테이킹 아이디",
  })
  id: number;

  @Column({
    type: "text",
    default: null,
    nullable: true,
    comment: "토큰 ID 및 스테이킹 시간 모음(JSON형식으로 저장)"
  })
  toxic_ape: string;

  @Column({
    type: "int",
    default: 0,
    comment: "총 스테이킹 수량"
  })
  toxic_ape_amount: number;

  @Column({
    type: "text",
    default: null,
    nullable: true,
    comment: "토큰 ID 및 스테이킹 시간 모음(JSON형식으로 저장)"
  })
  foolkat: string;

  @Column({
    type: "int",
    default: 0,
    comment: "총 스테이킹 수량"
  })
  foolkat_amount: number;

  @Column({
    type: "text",
    default: null,
    nullable: true,
    comment: "토큰 ID 및 스테이킹 시간 모음(JSON형식으로 저장)"
  })
  succubus: string;

  @Column({
    type: "int",
    default: 0,
    comment: "총 스테이킹 수량"
  })
  succubus_amount: number;

  @Column({
    type: "text",
    default: null,
    nullable: true,
    comment: "토큰 ID 및 스테이킹 시간 모음(JSON형식으로 저장)"
  })
  toxic_ape_special: string;

  @Column({
    type: "int",
    default: 0,
    comment: "총 스테이킹 수량"
  })
  toxic_ape_special_amount: number;

  @Column({
    type: "int",
    default: 0,
    comment: "총 지급 TP"
  })
  total_payments: number;

  @CreateDateColumn({
    comment: "생성 시간",
  })
  created_at: Date;

  @OneToOne(() => User, (user) => user.public_address, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: "user_address" })
  user_address: string;
}