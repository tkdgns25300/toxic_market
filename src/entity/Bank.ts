import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { BankLog } from "./BankLog";
import { BaseEntity } from "./Base";
  
@Entity("bank")
export class Bank extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "뱅크 아이디",
  })
  id: number;

  @Column({
    type: "datetime",
    comment: "예치 시작일",
  })
  start_at: Date;

  @Column({
    type: "datetime",
    comment: "예치 종료일",
  })
  end_at: Date;

  @Column({
    type: "int",
    comment: "일일분배 TP",
  })
  daily_Interest: number;

  @Column({
    type: "int",
    comment: "총 보상",
  })
  total_Interest: number;

  @Column({
    type: "int",
    comment: "총 예치규모",
  })
  deposit_Total: number;

  @Column({
    type: "int",
    comment: "예치 잔액",
    default: 0
  })
  deposit_Balance: number;

  @Column({
    type: "int",
    comment: "예치자 수",
    default: 0
  })
  deposit_User: number;

  @CreateDateColumn({
    comment: "뱅크 등록 일자",
  })
  created_at: Date;

  @OneToMany(() => BankLog, (log) => log.bank_id, {
    cascade: true
  })
  bank_logs: BankLog[];
}
  