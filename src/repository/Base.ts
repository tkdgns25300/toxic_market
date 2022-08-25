import { createQueryBuilder } from "typeorm";
import { PageReq, UserSearchReq } from "../api";
import { convertStringToEntity } from "../util/convertStringToEntity";

interface joinArrItem {
  property: string;
  alias: string;
}

export class BaseQueryRepo {
  schemaName: string;
  schemaClassName: string;
  constructor(schemaName, schemaClassName) {
    this.schemaName = schemaName;
    this.schemaClassName = schemaClassName;
  }

  findAll(param: PageReq, joinOpt: Array<joinArrItem> = []) {
    const result = createQueryBuilder(this.schemaName);

    if (joinOpt.length > 0) {
      joinOpt.forEach((option) => {
        result.leftJoinAndSelect(option.property, option.alias);
      });
    }

    return result
      .skip(param.getOffset())
      .take(param.getLimit())
      .getManyAndCount();
  }

  async findOne(
    whereKey: string,
    whereValue: string | number,
    joinOpt: Array<joinArrItem> = []
  ) {
    const query = createQueryBuilder(this.schemaName);

    if (joinOpt.length > 0) {
      joinOpt.forEach((option) => {
        query.leftJoinAndSelect(option.property, option.alias);
      });
    }

    const result = await query
      .where(`${this.schemaClassName}.${whereKey} = :${whereKey}`, {
        [whereKey]: whereValue,
      })
      .getOne();
    const entity_ = convertStringToEntity(this.schemaClassName);
    return new entity_().getEntity(this.schemaClassName, result);
  }

  create(paramObj: object) {
    console.log('this.schemaClassName :', this.schemaClassName)
    console.log('paramObj :', paramObj)

    return createQueryBuilder()
      .insert()
      .into(convertStringToEntity(this.schemaClassName))
      .values(paramObj)
      .execute();
  }

  update(paramObj: object, whereKey: string, whereValue: string | number) {
    return createQueryBuilder()
      .update(convertStringToEntity(this.schemaClassName))
      .set(paramObj)
      .where(`${this.schemaName}.${whereKey} = :${whereKey}`, {
        [whereKey]: whereValue,
      })
      .execute();
  }

  delete(whereKey: string, whereValue: string | number) {
    const entity_ = convertStringToEntity(this.schemaClassName);
    return createQueryBuilder()
      .delete()
      .from(entity_)
      .where(`${this.schemaName}.${whereKey} = :${whereKey}`, {
        [whereKey]: whereValue,
      })
      .execute();
  }
}
