import { BankLogDto } from "../dto";
import { Bank, BankLog } from "../entity";

export class DepositControl {
  constructor() {
  }
   /**
    * 사용자가 해당 뱅크에 예치한 내역이 없다면 뱅크 로그 객체를 만들어서 findBank에 push하는 함수
    * 
    * @param bank 예치하려는 뱅크
    * @param paramObj 예치 정보
    * @param shareholding 해당 사용자의 지분율
    * @param depositor 예치자 지갑 주소
    */
  public firstDeposit(bank: Bank, paramObj: BankLogDto, shareholding: number, depositor: string) { // 최초 예치 시
    const bankLog = new BankLog();
    bankLog.expected_Daily_Interest = this.getDailyInterest(bank.daily_Interest, shareholding);
    bankLog.bank_id = paramObj.bank_id;
    bankLog.deposit_Amount = paramObj.deposit_Amount; // 예치 잔액
    bankLog.expected_EaringRate = ((bankLog.expected_Daily_Interest * bank.remaing_Day) / paramObj.deposit_Amount) * 100; // 수익률 계산
    bankLog.depositor = depositor;
    bankLog.remaing_Day = bank.remaing_Day;

    bank.bank_logs.push(bankLog);

    bank.deposit_User = bank.deposit_User + 1; // 뱅크 예치자 추가
    bank.deposit_Balance = bank.deposit_Balance + paramObj.deposit_Amount; // 뱅크 예치 잔액 추가
  }

  /**
   * 사용자가 예치한 내역이 있다면 findBankLog 수정 후 save하는 함수
   * 
   * @param bankLog 사용자의 기존 예치내역
   * @param bank 예치하려는 뱅크
   * @param paramObj 예치 정보
   * @param shareholding 해당 사용자의 지분율
   */
  public retryDeposit(bankLog: BankLog, bank: Bank, paramObj: BankLogDto, shareholding: number) { // 복수 예치 시
    bankLog.expected_EaringRate = this.getEaringRate(bankLog.expected_Daily_Interest, bankLog.remaing_Day, bank.remaing_Day, bank.daily_Interest, shareholding, bankLog.deposit_Amount);
    bankLog.expected_Daily_Interest = this.getDailyInterest(bank.daily_Interest,shareholding);    
    bankLog.remaing_Day = bank.remaing_Day;
    bank.deposit_Balance = bank.deposit_Balance + paramObj.deposit_Amount; // 뱅크 예치 잔액 추가
  }

  /**
   * 해당 뱅크의 다른 사용자 뱅크 로그 수익률 및 예상 일일 보상 변경하는 함수
   * 
   * @param bankLog 다른 사용자의 뱅크 로그
   * @param bank 현재 예치되는 뱅크
   */
  public manageOtherDeposit(bankLog: BankLog, bank: Bank) { // 다른 예치자들 banklog 관리
    const userShareholding = this.getShareholing(bankLog.deposit_Amount, bank.deposit_Balance);
    const expected_Daily_Interest = this.getDailyInterest(bank.daily_Interest, userShareholding);

    const currentEaring = (bankLog.deposit_Amount * bankLog.expected_EaringRate / 100) - (bankLog.expected_Daily_Interest * bank.remaing_Day) // 지금까지 받은 수익

    bankLog.expected_EaringRate = ((bank.remaing_Day * expected_Daily_Interest) + currentEaring) / bankLog.deposit_Amount * 100;

    bankLog.expected_Daily_Interest = expected_Daily_Interest;

    // 기존에 있던 사용자의 수익률 산정 방식 변경
    // (총 예치한 금액 * 기존의 수익률 / 100) - (예상 일일 이자 * 뱅크 남은 일자) => 지금까지 받은 수익 계산 => 지금까지 받은 수익
    // 뱅크 남은 일자 * 예상 일일 이자 + 지금까지 받은 수익 / 해당 예치자 총 예치액
    // bankLog.expected_EaringRate = this.getEaringRate(bankLog.expected_Daily_Interest, bankLog.remaing_Day, bank.remaing_Day, bank.daily_Interest, userShareholding, bankLog.deposit_Amount);
  }

  /**
   * 지분율 계산 함수
   * 
   * 계산식 = 예치한 금액(동일 뱅크 재예치 시 초기 예치금 + 추가 예치금) / 뱅크 잔액 + 추가 예치금 
   * 
   * case1 사용자의 지분율 계산 시(최초 예치 or 재예치)에는 뱅크 잔액에 예치하는 금액이 포함되어 있지 않기 떄문에 분모에 예치하는 금액을 추가하기 위해 세번째 인자에 현재 예치금을 추가해줌
   * 
   * case2 이미 예치 중인 다른 사용자들의 지분율 계산 시에는 이미 뱅크 잔액에 추가되는 예치금이 포함되어 있지 때문에 세번째 인자는 넣지 않음
   * 
   * @param amount 현재 사용자가 예치하는 금액 또는 우선적으로 예치한 사람의 예치금액
   * @param addAmount 현재 예치되는 금액
   * @param balance 해당 뱅크의 기존 잔액
   * @returns 사용자 및 기존 예치한 사람들의 지분율
   */
  public getShareholing(amount: number, balance: number, addAmount: number = 0): number {
    return (amount / (addAmount + balance)) * 100;
  }

  /**
   * 예상 일일 이자 계산 함수
   * 
   * 계산식 = 예치한 뱅크의 일일 이자 * 사용자 지분율 / 100
   * 
   * @param dailyInterest 해당 뱅크의 일일지급이자
   * @param shareholding 지분율
   * @returns 사용자 및 기존 예치한 사람들의 지분율로 계산된 일일지급이자
   */
  private getDailyInterest(dailyInterest: number, shareholding: number): number {
    return dailyInterest * shareholding / 100
  }

  /**
   * 예상 수익률 계산 함수
   * 
   * 계산식 = (예치 당시일부터 현재까지 이자 총액 + 현재부터 만기까지 예상 이자 총액) / 예치 총액 * 100
   * 
   * case1 기존에 예치 내역이 있는 사용자가 추가 예치 시 수익률 계산
   * 
   * case2 뱅크의 다른 예치자들의 수익율 계산
   * 
   * @param expectedDailyInterest 예치 당시일부터 현재까지 이자 총액을 계산하기 위한 예상 일일 이자 금액
   * @param remaingDay 기존 예치 당시의 뱅크 남은 기간
   * @param currentRemaingDay 현재 뱅크 남은 기간
   * @param dailyInterest 뱅크의 일일 이자
   * @param shareholding 사용자의 지분율
   * @param depositAmount 뱅크의 예치 총액
   * @returns 해당 사용자의 수익률
   */
  private getEaringRate(expectedDailyInterest: number, remaingDay: number, currentRemaingDay: number, dailyInterest: number, shareholding: number, depositAmount: number): number {
    return ((expectedDailyInterest * (remaingDay - currentRemaingDay)) + (dailyInterest * shareholding / 100 * currentRemaingDay)) / depositAmount * 100;
  }
}