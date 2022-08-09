import { Service } from "typedi";
import { createQueryBuilder, EntityRepository } from "typeorm";
import { PageReq } from "../api";
import { RaffleLogSearchReq } from "../api/request/RaffleLogSearchReq";
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
    .leftJoinAndSelect("Raffle.raffle_logs", "raffle_log")
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "user.name",
      "user.phone",
      "raffle_log"
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

  async findAllApproved(param: PageReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle");
    
    // 진행중인 응모 (start_at 정렬)
    const ongoingRaffle = await createQueryBuilder("raffle")
    .leftJoinAndSelect("Raffle.raffle_logs", "raffle_log")
    .select([
      "Raffle",
      "raffle_log"
    ])
    .where('is_approved = :is_approved', {
      is_approved: "O"
    })
    .andWhere('end_at > :end_at', {
      end_at: new Date()
    })
    .orderBy('Raffle.start_at', 'DESC')
    .getManyAndCount()

    // 마감된 응모 (end_at 정렬)
    const finishedRaffle = await createQueryBuilder("raffle")
    .leftJoinAndSelect("Raffle.raffle_logs", "raffle_log")
    .select([
      "Raffle",
      "raffle_log"
    ])
    .where('is_approved = :is_approved', {
      is_approved: "O"
    })
    .andWhere('end_at <= :end_at', {
      end_at: new Date()
    })
    .orderBy('Raffle.end_at', 'DESC')
    .getManyAndCount()
    
    // Offset, Limit 적용 후 리턴
    let raffleArr = ongoingRaffle[0].concat(finishedRaffle[0]);
    raffleArr = raffleArr.slice(param.getOffset(), param.getOffset() + param.getLimit());
    const totalCount = ongoingRaffle[1] + finishedRaffle[1];
    console.log(raffleArr)
    console.log(totalCount)
    return [raffleArr, totalCount]
  }

  getOne(id: number) {
    const builder = createQueryBuilder("raffle");

    builder
    .leftJoinAndSelect("Raffle.raffle_logs", "raffle_log")
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "user.name",
      "user.public_address",
      "user.phone",
      "raffle_log"
    ])
    .where('Raffle.id = :id', {
      id: id
    })

    return builder.getOne();
  }

  getRaffleLogs(param: RaffleLogSearchReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle");

    builder
    .leftJoinAndSelect("Raffle.raffle_logs", "raffle_log")
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "user.public_address",
      "raffle_log"
    ])

    // seller 필터링
    if (param.seller !== undefined) {
      builder.where('user.public_address = :seller', {
        seller: param.seller
      })
    }

    // buyer 필터링
    if (param.buyer !== undefined) {
      builder.where(`raffle_log.applicant = :buyer`, {
        buyer: param.buyer
      })
    }

    builder.skip(param.getOffset()).take(param.getLimit());
    return builder.getManyAndCount();
  }

  findUserRaffles(param: PageReq, creator_address:string): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle");
    
    builder
    .leftJoinAndSelect("Raffle.raffle_logs", "raffle_log")
    .select([
      "Raffle",
      "raffle_log"
    ])
    .where('creator_address = :creator', {
      creator: creator_address
    })
    
    builder.skip(param.getOffset()).take(param.getLimit());
    return builder.getManyAndCount();
  }
}