enum UserType {
  GENERAL = "일반 사용자",
  SELLER = "판매자"
}

enum UserSellerType {
  BUSINESS = "개인사업자",
  CORPORATION = "법인",
  INDIVIDUAL = "개인"
}

enum LogClassification {
  PRODUCT = "마켓",
  AUCTION = "경매",
  RAFFLE = "응모"
}

export { UserType, UserSellerType, LogClassification };