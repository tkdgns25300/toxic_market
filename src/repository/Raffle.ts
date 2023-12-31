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
    .where(`user.name like :name`, {
      name: `%${param.getName}%`,
  })
    .andWhere("title like :title", {title: `%${param.getTitle}%`})
    .andWhere('is_approved IS NULL')
    .andWhere('end_at > :end_at', {
      end_at: new Date()
    })
    
    if (param.getUserToxicProject) {
      builder.andWhere(`user.toxic_project = :toxic_project`, {toxic_project: param.getUserToxicProject})
    }
    if (param.getUserCatboticaProject) {
        builder.andWhere(`user.catbotica_project = :catbotica_project`, {catbotica_project: param.getUserCatboticaProject})
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
    .where(`user.name like :name`, {
      name: `%${param.getName}%`,
    })
    .andWhere("title like :title", {title: `%${param.getTitle}%`})
    .andWhere('is_approved = :is_approved', {
      is_approved: "O"
    })
    .andWhere('end_at > :end_at', {
      end_at: new Date()
    })
    
    if (param.getUserToxicProject) {
      builder.andWhere(`user.toxic_project = :toxic_project`, {toxic_project: param.getUserToxicProject})
    }
    if (param.getUserCatboticaProject) {
        builder.andWhere(`user.catbotica_project = :catbotica_project`, {catbotica_project: param.getUserCatboticaProject})
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
    .where(`user.name like :name`, {
      name: `%${param.getName}%`,
    })
    .andWhere("title like :title", {title: `%${param.getTitle}%`})
    .andWhere('is_approved = :is_approved', {
      is_approved: "O"
    })
    .andWhere('end_at <= :end_at', {
      end_at: new Date()
    })

    if (param.getUserToxicProject) {
      builder.andWhere(`user.toxic_project = :toxic_project`, {toxic_project: param.getUserToxicProject})
    }
    if (param.getUserCatboticaProject) {
        builder.andWhere(`user.catbotica_project = :catbotica_project`, {catbotica_project: param.getUserCatboticaProject})
    }

    builder.skip(param.getOffset()).take(param.getLimit());
    return builder.getManyAndCount();
  }

  async findAllApproved(param: PageReq): Promise<[Array<any>, number]> {
    const builder = createQueryBuilder("raffle");
    
    // 진행중인 응모 (start_at 정렬)
    const ongoingRaffle = await createQueryBuilder("raffle")
    .leftJoinAndSelect("Raffle.raffle_logs", "raffle_log")
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "raffle_log",
      "user.public_address"
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
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "raffle_log",
      "user.public_address"
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
    return [raffleArr, totalCount]
  }

  getOne(id: number) {
    const builder = createQueryBuilder("raffle");

    builder
    .leftJoinAndSelect("Raffle.raffle_logs", "raffle_log")
    .leftJoinAndSelect("Raffle.creator", "user")
    .select([
      "Raffle",
      "user.nickname",
      "user.public_address",
      "user.phone",
      "user.profile_img",
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
    .orderBy("raffle_log.created_at", "DESC")

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