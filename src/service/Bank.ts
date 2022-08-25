import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PageReq, PageResList, PageResObj } from "../api";
import { BankDto } from "../dto";
import { Bank } from "../entity";
import { BankQueryRepo } from "../repository/Bank";

@Service()
export class BankService {
  constructor(
    @InjectRepository()
    readonly bankQueryRepo: BankQueryRepo,
  ) {}

  async findAll(param: PageReq): Promise<PageResList<Bank>> {
    const result = await this.bankQueryRepo.findAll(param);
    return new PageResList<Bank>(
      result[1],
      param.limit,
      result[0].map((el: Bank) => {
        return el;
      }),
      "Bank 목록을 찾는데 성공했습니다."
    );
  };

  async create(paramObj: BankDto): Promise<PageResObj<Bank | {}>> {
    const bank = await this.bankQueryRepo.create(paramObj);
    const result = await this.bankQueryRepo.findOne("id", bank.identifiers[0].id);

    return new PageResObj(result, "Bank 생성에 성공했습니다.");
  }
}
