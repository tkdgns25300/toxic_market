import {
  User,
  Product,
  Log,
  Auction,
  BidLog
} from "../entity";

export const convertStringToEntity = (entityName: string) => {
  const convertList = {
    ["User"]: User,
    ["Product"]: Product,
    ["Log"]: Log,
    ["Auction"]: Auction,
    ["BidLog"]: BidLog
  };
  return convertList[entityName];
};
