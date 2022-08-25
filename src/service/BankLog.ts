import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { BankLogQueryRepo } from "../repository/BankLog";

@Service()
export class BankLogService {
  constructor(
    @InjectRepository()
    readonly bankLogQueryRepo: BankLogQueryRepo,
  ) {}
}
