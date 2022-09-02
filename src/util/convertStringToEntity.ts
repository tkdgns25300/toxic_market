import {
  User,
  Product,
  Log,
  Auction,
  BidLog,
  Raffle,
  RaffleLog,
  Banner,
  Bank,
  BankLog,
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
    ["Bank"]: Bank,
    ["BankLog"]: BankLog,
    ["Staking"]: Staking
  };
  return convertList[entityName];
};
