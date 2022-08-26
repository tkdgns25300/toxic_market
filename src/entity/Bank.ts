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
    type: "varchar",
    comment: "예치 시작일(예시 2022-10-01)",
  })
  start_at: string;

  @Column({
    type: "varchar",
    comment: "예치 종료일(예시 2023-10-01)",
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

  @Column({
    type: "int",
    comment: "남은 일수(매일 00시에 -1 작용할 것임)",
  })
  remaing_Day: number;

  @CreateDateColumn({
    comment: "뱅크 등록 일자",
  })
  created_at: Date;

  @OneToMany(() => BankLog, (log) => log.bank_id, {
    cascade: true
  })
  bank_logs: BankLog[];
}
  

// Bank가 23일부터 25일까지일 경우
// 24일 00시에 이자 지급 1                 remaining_day = 3 => 2
// 25일 00시에 이자 지급 2                 remaining_day = 2 => 1
// 26일 00시에 이자 지급 + 원금 지급 3일째!   remaining_day = 1 => 0
// 예치 진행 기간이 25일까지니깐 날이 바뀌는 00시에 지급한다!는 정책으로 진행하면 될 듯


// 은행의 경우 1년으로 치면 365일이 아닌
// 2022-08-26 ~ 2023-08-26으로 일수로 따지면 366일임
// 그리고 다음 날에 자유롭게 해지가 가능함

// 이러한 방법처럼 남은 일수는 째(예시 3일째)로 계산하며
// 지급은 예치 종료 일자가 끝나는 시간(24:00)에 진행된다

// 일자 계산이라 윤달 여부가 필요없음