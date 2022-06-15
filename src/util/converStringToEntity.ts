import {
  User,
} from "../entity";

export const convertStringToEntity = (entityName: string) => {
  const convertList = {
    ["Admin"]: User,
  };
  return convertList[entityName];
};
