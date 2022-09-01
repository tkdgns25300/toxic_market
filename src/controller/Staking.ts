// /**
//  * To transfer your NFT to another wallet, follow these simple steps:
//  * 
//  * 1. Open your wallet to view your NFTs.
//  * 2. Choose the NFT you want to send.
//  * 3. Enter the recipient’s public wallet address (or ENS).
//  * 4. Approve the transaction.
//  * 5. Verify your transfer using Etherscan.
//  * 
//  */

import { Response } from "express";
import { Body, Get, JsonController, Post, QueryParams, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageResObj } from "../api";
import { StakingSearchReq } from "../api/request/StakingSearchReq";
import { StakingContractTokenDto } from "../dto/Staking";
import { checkAccessToken } from "../middlewares/Auth";
import { StakingService } from "../service/Staking";

// /**
//  * Transferring Your NFTs Safely
//  * 
//  * 1. Never give out your wallet’s secret phrase
//  * 2. Verify the recipients’ wallet address
//  * 3. Always choose the “Fast” transaction speed
//  * 4. Don’t send someone an NFT if you are awaiting payment
//  * 5. Be aware of common NFT scams
//  * 
//  */

// 전체 로직
// 1. 해당 유저의 보유 NFT 확인 API(Pagenation + sort 필요)
// : Token History API('https://refs.klaytnapi.com/ko/tokenhistory/latest#operation/getNftsByOwnerAddress');
// 2. 톡시 지갑에 스테이킹 되어있는 해당 유저의 보유 NFT 확인 API(Pagenation + sort 필요)
// : 
// 3. 스테이킹 API
// : 가스비 확인
// 4. 언스테이킹 API
// : 가스비 확인
// 5. 정오(12:00 PM) 예약 API(람다)
// 6. 스테이킹 목록 조회 API
// 7. 스테이킹 이용 유저의 포인트 지급내역 조회 API

@Service()
@JsonController("/staking")
export class StakingController {
  @Inject()
  stakingSerivce: StakingService;

  @Get("/user")
  @UseBefore(checkAccessToken)
  public async findUserNFT(@QueryParams() params: StakingSearchReq, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.stakingSerivce.findUserNFT(params, aud)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/stak")
  @UseBefore(checkAccessToken)
  public async stakingNFT(@Body() params: StakingContractTokenDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.stakingSerivce.stakingNFT(params, aud);  
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/staking")
  @UseBefore(checkAccessToken)
  public async findUserStakingNFT(@QueryParams() params: StakingSearchReq, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.stakingSerivce.findUserStakingNFT(params, aud)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}