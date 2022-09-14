import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./Base";
import { Staking } from "./Staking";

@Entity("staking_log")
export class StakingLog extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "스테이킹 아이디",
  })
  id: number;

  @Column({
    type: "int",
    comment: "지급 금액"
  })
  payment_amount: number;

  @Column({
    type: "int",
    default: 0,
    comment: "총 스테이킹 수량"
  })
  toxic_ape_amount: number;

  @Column({
    type: "int",
    default: 0,
    comment: "총 스테이킹 수량"
  })
  foolkat_amount: number;

  @Column({
    type: "int",
    default: 0,
    comment: "총 스테이킹 수량"
  })
  succubus_amount: number;

  @Column({
    type: "int",
    default: 0,
    comment: "총 스테이킹 수량"
  })
  toxic_ape_special_amount: number;

  @CreateDateColumn({
    comment: "생성 시간",
  })
  created_at: Date;

  @ManyToOne(() => Staking, (staking) => staking.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "staking_id" })
  staking_id: number;
}