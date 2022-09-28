import { Response } from "express";
import { Body, Get, JsonController, Param, Post, QueryParam, QueryParams, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq, PageResObj } from "../api";
import { ErrorNFTSearchReq } from "../api/request/ErrorNFTSearchReq";
import { NftSearchReq } from "../api/request/NftSearchReq";
import { StakingLogSearchReq } from "../api/request/StakingLogSearchReq";
import { StakingSearchReq } from "../api/request/StakingSearchReq";
import { StakingContractTokenDto } from "../dto/Staking";
import { checkAccessToken, checkAdminAccessToken } from "../middlewares/Auth";
import { StakingService } from "../service/Staking";

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
  public async payPoint(@Param("key") key: string) {
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
  @UseBefore(checkAccessToken)
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

  @Get("/staking_log")
  @UseBefore(checkAccessToken)
  public async findStakingLog(@QueryParams() params: StakingLogSearchReq) {
    try {
      return await this.stakingSerivce.findStakingLog(params)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  // For staked but not recorded NFTs
  @Post("/error_nft/:key")
  public async errorNFT(@Param("key") key: string, @QueryParams() params: ErrorNFTSearchReq) {
    try {
      return await this.stakingSerivce.errorNFT(key, params)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  // For Air Drop
  @Post("/air_drop/:key")
  public async airDrop(@Param("key") key: string) {
    try {
      return await this.stakingSerivce.airDrop(key)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}