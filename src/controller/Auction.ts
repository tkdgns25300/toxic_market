import { Response } from "express";
import {
  Body,
  Get,
  JsonController,
  Param, Patch,
  Post,
  QueryParams,
  Res,
  UseBefore,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq, PageResObj } from "../api";
import {AuctionDto, BidDto, ProductDto} from "../dto";
import {checkAccessToken, checkAdminAccessToken} from "../middlewares/Auth";
import { AuctionService } from "../service/Auction";
import {AuctionSearchReq} from "../api/request/AuctionSearchReq";

@Service()
@JsonController("/auction")
export class AuctionController {
  @Inject()
  auctionService: AuctionService;
  /**
   *    Service
   *  GET  /getAllApproved  only auction itself
   *  GET  /getUser'sAuctions  only auction itself
   *  POST  /create (Seller only)
   *  GET  /getOne/:id  with BidLogs
   *  PATCH /bid/:id  (Seller can not bid)
   *
   *
   *   Admin - Get All requests has filtering by name and phone number
   *   GET  /getAllNotApproved with user
   *   GET  /getAllApprovedAndNotFinished with user
   *   GET  /getAllApprovedAndFinished with user
   *   GET  /getOne/:id  with BidLogs and user
   *   PATCH /confirm/:id  /update
   *   PATCH /finish/:id  /update
   * */


  @Post("/create")
  @UseBefore(checkAccessToken)
  public async create(@Body() params: AuctionDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.auctionService.create(params, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Patch("/update/:id")
  @UseBefore(checkAccessToken)
  public async update(@Param("id") id: number,@Body() params: AuctionDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.auctionService.update(params, id, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/confirm/:id")
  @UseBefore(checkAdminAccessToken)
  public async confirm(@Param("id") id: number,@Body() paramObj: AuctionDto, @Res() res: Response) {
    try {
      return await this.auctionService.confirm(paramObj,id);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/finish/:id")
  @UseBefore(checkAdminAccessToken)
  public async finish(@Param("id") id: number,@Body() paramObj: AuctionDto, @Res() res: Response) {
    try {
      return await this.auctionService.finish(paramObj,id, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Post("/bid")
  @UseBefore(checkAccessToken)
  public async bid(@Body() params: BidDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.auctionService.bid(params, aud, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/bids")
  @UseBefore(checkAccessToken)
  public async getBids(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.auctionService.findBidLogs(param, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/newest")
  @UseBefore(checkAccessToken)
  public async getNewest() {
  try {
    return await this.auctionService.getNewest();
  } catch (err) {
    if (err instanceof QueryFailedError) {
      return new PageResObj({}, err.message, true);
    }
    return new PageResObj({}, err.message, true);
  }
}

  @Get("/approved")
  @UseBefore(checkAccessToken)
  public async getAllApproved(@QueryParams() param: PageReq) {
  try {
    return await this.auctionService.findAllApproved(param);
  } catch (err) {
    if (err instanceof QueryFailedError) {
      return new PageResObj({}, err.message, true);
    }
    return new PageResObj({}, err.message, true);
  }
  }

  @Get("/user")
  @UseBefore(checkAccessToken)
  public async getUserAuctions(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      return await this.auctionService.findUserAuctions(param, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/find/:id")
  @UseBefore(checkAccessToken)
  public async getOne(@Param("id") id: number, @Res() res: Response) {
    try {
      const { admin } = res.locals.jwtPayload;
      return await this.auctionService.findOne(id, admin);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/unapproved")
  @UseBefore(checkAdminAccessToken)
  public async getAllNotApproved(@QueryParams() param: AuctionSearchReq) {
    try {
      return await this.auctionService.findAllNotApproved(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/ongoing")
  @UseBefore(checkAdminAccessToken)
  public async getAllApprovedAndNotFinished(@QueryParams() param: AuctionSearchReq, @Res() res: Response) {
    try {
      return await this.auctionService.findAllApprovedAndNotFinished(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }

  @Get("/finished")
  @UseBefore(checkAdminAccessToken)
  public async getAllApprovedAndFinished(@QueryParams() param: AuctionSearchReq, @Res() res: Response) {
    try {
      return await this.auctionService.findAllApprovedAndFinished(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      }
      return new PageResObj({}, err.message, true);
    }
  }
}
