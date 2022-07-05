import {
  User,
  Product,
  Log
} from "../entity/market";

export const convertStringToEntity = (entityName: string) => {
  const convertList = {
    ["User"]: User,
    ["Product"]: Product,
    ["Log"]: Log
  };
  return convertList[entityName];
};
