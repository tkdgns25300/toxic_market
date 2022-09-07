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
    comment: "토큰 ID 모음($로 구분)"
  })
  toxic_ape: string;

  @Column({
    type: "text",
    default: null,
    nullable: true,
    comment: "각 토큰 ID의 스테이킹 시간 모음($로 구분)"
  })
  toxic_ape_staking_time: string;

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
    comment: "토큰 ID 모음($로 구분)"
  })
  foolkat: string;

  @Column({
    type: "text",
    default: null,
    nullable: true,
    comment: "각 토큰 ID의 스테이킹 시간 모음($로 구분)"
  })
  foolkat_staking_time: string;

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
    comment: "토큰 ID 모음($로 구분)"
  })
  succubus: string;

  @Column({
    type: "text",
    default: null,
    nullable: true,
    comment: "각 토큰 ID의 스테이킹 시간 모음($로 구분)"
  })
  succubus_staking_time: string;

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
    comment: "토큰 ID 모음($로 구분)"
  })
  toxic_ape_special: string;

  @Column({
    type: "text",
    default: null,
    nullable: true,
    comment: "각 토큰 ID의 스테이킹 시간 모음($로 구분)"
  })
  toxic_ape_special_staking_time: string;

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