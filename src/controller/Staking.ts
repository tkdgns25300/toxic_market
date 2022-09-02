import { Response } from "express";
import { Body, Get, JsonController, Param, Post, QueryParams, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq, PageResObj } from "../api";
import { NftSearchReq } from "../api/request/NftSearchReq";
import { StakingSearchReq } from "../api/request/StakingSearchReq";
import { StakingContractTokenDto } from "../dto/Staking";
import { checkAccessToken, checkAdminAccessToken } from "../middlewares/Auth";
import { StakingService } from "../service/Staking";

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

  @Get("/nft/mine")
  @UseBefore(checkAccessToken)
  public async findUserNFT(@QueryParams() params: NftSearchReq, @Res() res: Response) {
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

  @Get("/nft/staking")
  @UseBefore(checkAccessToken)
  public async findUserStakingNFT(@QueryParams() params: NftSearchReq, @Res() res: Response) {
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

  @Post("/unstak")
  @UseBefore(checkAccessToken)
  public async unstakingNFT(@Body() params: StakingContractTokenDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.stakingSerivce.unstakingNFT(params, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/payment/:key")
  public async payPoint(@Param("key") key: string ) {
    try {
      return await this.stakingSerivce.payPoint(key, null)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/staking")
  @UseBefore(checkAdminAccessToken)
  public async findStaking(@QueryParams() params: StakingSearchReq) {
    try {
      return await this.stakingSerivce.findStaking(params)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}