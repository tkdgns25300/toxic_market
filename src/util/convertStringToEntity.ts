import {
  User,
  Product,
  Log,
  Auction,
  BidLog,
  Raffle,
  RaffleLog,
  Banner,
  Staking
} from "../entity";

export const convertStringToEntity = (entityName: string) => {
  const convertList = {
    ["User"]: User,
    ["Product"]: Product,
    ["Log"]: Log,
    ["Auction"]: Auction,
    ["BidLog"]: BidLog,
    ["Raffle"]: Raffle,
    ["RaffleLog"]: RaffleLog,
    ["Banner"]: Banner,
    ["Staking"]: Staking
  };
  return convertList[entityName];
};
