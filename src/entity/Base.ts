import { convertStringToEntity } from "../util/convertStringToEntity";

export class BaseEntity {
  getEntity(schemaClassName: string, param: object) {
    if (!param) {
      return param;
    } // param이 undefined나 null일 경우 그대로 리턴한다

    const paramKeys = Object.keys(param);
    // param이 갖고 있는 키값을 모은다
    const entity_ = convertStringToEntity(schemaClassName);
    // convertStringToEntity를 사용해서 엔티티로 만든다
    const result = new entity_();
    // 새로운 엔티티를 만들고
    // params가 갖고 있는 정보를 result에 담는다
    paramKeys.forEach((key) => {
      result[key] = param[key];
    });
    return result;
  }
}

// FindOption vs QueryBuilder in TypeORM

// There are some special methods in query builder which you can use, but you would rarely use them. 
// In most of case FindOption is enough for your queries, but I recommend to use QueryBuilder, 
// because using it you will write more complex and readable queries more easily.