import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "./Base";
import { RaffleLog } from "./RaffleLog";

@Entity("raffle")
export class Raffle extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "추첨 아이디",
  })
  id: number;

  @Column({
    type: "int",
    comment: "응모 가격",
  })
  price: number;

  @CreateDateColumn({
    comment: "추첨 시작일",
  })
  start_at: Date;

  @CreateDateColumn({
    comment: "추첨 종료일",
  })
  end_at: Date;

  @Column({
    type: "varchar",
    length: 50,
    comment: "상품명",
  })
  title: string;

  @Column({
    type: "text",
    comment: "상품 설명",
  })
  description: string;

  @Column({
    type: "varchar",
    length: 200,
    comment: "판매자 연락 링크",
  })
  contact: string;

  @CreateDateColumn({
    comment: "생성 시간",
  })
  created_at: Date;

  @Column({
    type: "char",
    length: 42,
    comment: "등록자 지갑주소",
  })
  creator_address: string;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
    comment: "대표 이미지 주소",
  })
  main_img_url: string;

  @Column({
    type: "text",
    nullable: true,
    comment: "서브 이미지 주소",
  })
  sub_img_url: string;

  @Column({
    type: "char",
    length: 1,
    nullable: true,
    default: null,
    comment: "관리자 승인 여부",
  })
  is_approved: string;

  @Column({
    type: "char",
    length: 1,
    nullable: true,
    default: null,
    comment: "추첨의 성공적인 마무리 여부",
  })
  is_succeed: string;

  @OneToMany(() => RaffleLog, (raffle_log) => raffle_log.id, { cascade: true })
  raffle_logs: RaffleLog[];
}
