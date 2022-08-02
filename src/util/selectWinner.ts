import { RaffleLog } from "../entity";

export const selectWinner = (raffleLogArr: RaffleLog[]): number => {
  // Box 만들기
  let box = [];
  raffleLogArr.forEach((log: RaffleLog) => {
    const logArr = new Array(log.amount).fill(log.id);
    box = box.concat(logArr);
  })

  // Box의 길이만큼의 random Number 생성
  const ranNum = Math.floor(Math.random() * box.length);

  // 그중 하나 뽑아서 리턴
  return box[ranNum];
}