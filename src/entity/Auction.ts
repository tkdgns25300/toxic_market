import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne,
} from "typeorm";
import { BaseEntity } from "./Base";
import {BidLog} from "./BidLog";
import {User} from "./User";

@Entity("auction")
export class Auction extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "경매 아이디",
  })
  id: number;

  @Column({
    type: "int",
    comment: "상품 가격",
  })
  price: number;

  @CreateDateColumn({
    comment: "경매 시작일",
  })
  start_at: Date;

  @CreateDateColumn({
    comment: "경매 종료일",
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
    comment: "판매자 연락 링크",
  })
  contact: string;

  @CreateDateColumn({
    comment: "생성 시간",
  })
  created_at: Date;

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
    default: "O",
    comment: "관리자 허락 여부"
  })
  is_approved: string;

  @Column({
    type: "char",
    length: 1,
    default: "O",
    comment: "경매의 성공적인 마무리 여부"
  })
  is_succeed: string;

  @Column({
    type: "char",
    length: 42,
    comment: "제일 높은 금액을 입찰한 사용자 주소",
  })
  bidder: string;

  @Column({
    type: "int",
    comment: "제일 높은 입찰가격",
  })
  bid: number;

  @OneToMany(() => BidLog, (detail) => detail.auction_id)
  bid_logs: BidLog[];

  @ManyToOne(() => User, (admin) => admin.public_address, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: "creator" })
  creator: string;
}
