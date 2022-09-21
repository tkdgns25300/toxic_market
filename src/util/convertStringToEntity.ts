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
  Staking,
  StakingLog,
  ExchangeLog
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
    ["Staking"]: Staking,
    ["StakingLog"]: StakingLog,
    ["ExchangeLog"]: ExchangeLog,
  };
  return convertList[entityName];
};
