import { Service } from "typedi";
import { createQueryBuilder, EntityRepository } from "typeorm";
import { PageReq } from "../api";
import { RaffleSearchReq } from "../api/request/RaffleSearchReq";
import { Raffle } from "../entity";
import { BaseQueryRepo } from "./Base";

@Service()
@EntityRepository(Raffle)
export class RaffleQueryRepo extends BaseQueryRepo {
  constructor() {
    super("raffle", "Raffle")
  }

  findAllNotApproved(param: RaffleSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle");
    
    builder
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "user.name",
      "user.phone"
    ])
    .where('is_approved IS NULL')
    .andWhere('end_at > :end_at', {
      end_at: new Date()
    })

    if (param.name) {
      builder.andWhere('name like :name', { name: `%${param.name}%` });
    }
    if (param.title) {
      builder.andWhere('title like :title', { title: `%${param.title}%` });
    }
    
    builder.skip(param.getOffset()).take(param.getLimit());
    return builder.getManyAndCount();
  }

  
  getAllApprovedAndNotFinished(param: RaffleSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle");
    
    builder
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "user.name",
      "user.phone"
    ])
    .where('is_approved = :is_approved', {
      is_approved: "O"
    })
    .andWhere('end_at > :end_at', {
      end_at: new Date()
    })

    if (param.name) {
      builder.andWhere('name like :name', { name: `%${param.name}%` });
    }
    if (param.title) {
      builder.andWhere('title like :title', { title: `%${param.title}%` });
    }

    builder.skip(param.getOffset()).take(param.getLimit());
    return builder.getManyAndCount();
  }
  
  getAllApprovedAndFinished(param: RaffleSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle");
    
    builder
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "user.name",
      "user.phone"
    ])
    .where('is_approved = :is_approved', {
      is_approved: "O"
    })
    .andWhere('end_at <= :end_at', {
      end_at: new Date()
    })

    if (param.name) {
      builder.andWhere('name like :name', { name: `%${param.name}%` });
    }
    if (param.title) {
      builder.andWhere('title like :title', { title: `%${param.title}%` });
    }

    builder.skip(param.getOffset()).take(param.getLimit());
    return builder.getManyAndCount();
  }

  findAllApproved(param: PageReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle");
    
    builder
    .where('is_approved = :is_approved', {
      is_approved: "O"
    })
    
    builder.skip(param.getOffset()).take(param.getLimit());
    return builder.getManyAndCount();
  }

  getOne(id: number) {
    const builder = createQueryBuilder("raffle");

    builder
    .leftJoinAndSelect("Raffle.raffle_logs", "raffle_log")
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "user.name",
      "user.phone",
      "raffle_log"
    ])
    .where('Raffle.id = :id', {
      id: id
    })

    return builder.getOne();
  }
}