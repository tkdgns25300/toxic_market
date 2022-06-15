import { convertStringToEntity } from "../util/converStringToEntity";

export class BaseEntity {
  getEntity(schemaClassName: string, param: object) {

    if(!param) {
      return param
    }
    const paramKeys =  Object.keys(param);
    const entity_ = convertStringToEntity(schemaClassName);
    const result = new entity_();
    paramKeys.forEach((key) => {
      result[key] = param[key];
    });
    return result;
  }
}
