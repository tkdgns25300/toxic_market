import {
  User,
  Product,
  Log,
  Auction,
  BidLog,
  Raffle,
  RaffleLog
} from "../entity";

export const convertStringToEntity = (entityName: string) => {
  const convertList = {
    ["User"]: User,
    ["Product"]: Product,
    ["Log"]: Log,
    ["Auction"]: Auction,
    ["BidLog"]: BidLog,
    ["Raffle"]: Raffle,
    ["RaffleLog"]: RaffleLog
  };
  return convertList[entityName];
};
