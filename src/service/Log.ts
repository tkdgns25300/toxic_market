import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { LogQueryRepo } from "../repository/Log";
import { Log } from "../entity";
import { PageResList } from "../api";
import { LogSearchReq } from "../api/request/LogSearchReq";
import { RaffleLogQueryRepo } from "../repository/RaffleLog";
import { BidLogQueryRepo } from "../repository/BIdLog";
import { LogClassification } from "../enum";

@Service()
export class LogService {
  constructor(
    @InjectRepository()
    readonly LogQueryRepo: LogQueryRepo,
    readonly raffleLogQueryRepo: RaffleLogQueryRepo,
    readonly bidLogQueryRepo: BidLogQueryRepo
  ) {}

  async findAllLogs(): Promise<PageResList<Log>> {
    // 마켓, 경매, 응모 내역을 규격 하나로 통일
    interface logType {
      classification: LogClassification,
      title: string,
      buyer_id: string,
      seller_id: string,
      amount: number,
      total_point: number
    }

    // 각 마켓, 경매, 응모 로그 수집


    // created_at 순으로 나열

    
    // 반환


  }
}
