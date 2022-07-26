import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BaseEntity } from "./Base";
import { Raffle } from "./Raffle";

@Entity("raffle_log")
export class RaffleLog extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "로그 아이디",
  })
  id: number;

  @Column({
    type: "varchar",
    length: 42,
    comment: "응모자 지갑 주소",
  })
  applicant: string;

  @Column({
    type: "int",
    comment: "응모 수량",
  })
  amount: number;

  @Column({
    type: "char",
    length: 1,
    nullable: true,
    default: null,
    comment: "당첨 여부",
  })
  is_winner: string;

  @CreateDateColumn({
    comment: "입찰 일자",
  })
  created_at: Date;

  @ManyToOne(() => Raffle, (raffle) => raffle.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  raffle_id: number;
}
