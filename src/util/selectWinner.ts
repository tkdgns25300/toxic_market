import { RaffleLog } from "../entity";

export const selectWinner = (raffleLogArr: RaffleLog[]): number => {

  for (let log of raffleLogArr) {
    console.log(log)
  }
  return 1;
}

// https://cruella-de-vil.tistory.com/70
const getPrize = function() {
  //랜덤값 생성 (1~100)
  const ranNum = Math.floor((Math.random() * 99) +1)

  //경품 생성
  const gift = ['1등 iMAC PRO', '2등 MAC BOOK PRO', '3등 iPAD', '다음기회에']
  //확률 생성
  const pbt = [5, 15, 30, 50]
  //리턴 경품 값
  let res = ''

  for (let i = 0; i < gift.length; i++) {

      if(pbt[i] >= ranNum){
          res = gift[i]
          return res
      }
      else if (pbt[pbt.length - 1] < ranNum) {
          res = gift[gift.length - 1]
          return res
      }
  }
}