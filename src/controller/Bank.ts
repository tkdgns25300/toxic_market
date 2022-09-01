import { Response } from "express";
import {
  Body,
  Get, JsonController, Param, Post, QueryParams, Res,
  UseBefore
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { QueryFailedError } from "typeorm";
import { PageReq, PageResObj } from "../api";
import { BankDto, BankLogDto } from "../dto";
import { checkAccessToken, checkAdminAccessToken } from "../middlewares/Auth";
import { BankService } from "../service/Bank";

@Service()
@JsonController("/bank")
export class BankController {
  @Inject()
  bankService: BankService;

  @Get("/find") // 관리자 페이지에서 사용되는 뱅크 조회
  @UseBefore(checkAdminAccessToken)
  public async getAllBank(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      return await this.bankService.findAll(param);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      };
      return new PageResObj({}, err.message, true);
    };
  };

  @Post("/create") // 뱅크 생성
  @UseBefore(checkAdminAccessToken)
  public async createBank(@Body() params: BankDto, @Res() res: Response) {
    try {
      return await this.bankService.create(params);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      };
      return new PageResObj({}, err.message, true);
    };
  };

  @Get("/user") // 서비스 페이지에서 사용되는 뱅크 조회(해당 사용자의 뱅크 예치 내역이 담김)
  @UseBefore(checkAccessToken)
  public async getAllBankWithUser(@QueryParams() param: PageReq, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;
      
      return await this.bankService.findBankWithUser(param, aud);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      };
      return new PageResObj({}, err.message, true);
    };
  };

  @Post("/deposit") // 예치 생성 및 업데이트
  @UseBefore(checkAccessToken)
  public async depositBank(@Body() params: BankLogDto, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;

      return await this.bankService.deposit(params, aud, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      };
      return new PageResObj({}, err.message, true);
    };
  };

  @Post('/withdraw/:id') // 누적 보상 수령
  @UseBefore(checkAccessToken)
  public async withdraw(@Param("id") id: number, @Res() res: Response) {
    try {
      const { aud } = res.locals.jwtPayload;

      return await this.bankService.withdraw(id, aud, null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      };
      return new PageResObj({}, err.message, true);
    };
  };

  // 람다에서 사용할 컨트롤러 => 예치 중인 사용자에게 일일 보상 지급 및 만기 뱅크 예치금 지급
  @Post('/interest')
  public async payInterestAndDeposit(@Res() res: Response) {
    try {
      return await this.bankService.payInterestAndDeposit(null);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        return new PageResObj({}, err.message, true);
      };
      return new PageResObj({}, err.message, true);
    };
  };
}


// 람다에서 사용할 코드
// const https = require('https');

// function postRequest(body) {
//   const options = {
//     hostname: 'localhost',
//     path: '/bank/interest',
//     method: 'POST',
//     port: 4000, // 👈️ replace with 80 for HTTP requests
//     // headers: {
//     //   'Content-Type': 'application/json',
//     // },
//     // body: body
//   };

//   return new Promise((resolve, reject) => {
//     console.log('options :', options)
//     const req = https.request(options, res => {
//       let rawData = '';

//       res.on('data', chunk => {
//         rawData += chunk;
//       });

//       res.on('end', () => {
//         try {
//           console.log('정상적으로 된 것인가', rawData)
//           resolve(rawData)
//         } catch (err) {
//           console.log('err :', err)
//           reject(new Error(err));
//         }
//       });
//     });
    
//     console.log('req :', req)

//     req.on('error', err => {
//       reject(new Error(err));
//     });

//     // 👇️ write the body to the Request object
//     req.write(JSON.stringify(body));
//     req.end();
//   });
// }

// exports.handler = async event => {
//   try {
//     const result = await postRequest({
//         userInfo: {
//             userId: "guest", password: "1234"
//         }
//     });
//     console.log('result is: 👉️', result);

//     // 👇️️ response structure assume you use proxy integration with API gateway
//     return {
//       statusCode: 200,
//       headers: {'Content-Type': 'application/json'},
//       body: result,
//     };
//   } catch (error) {
//     console.log('Error is: 👉️', error);
//     return {
//       statusCode: 400,
//       body: error.message,
//     };
//   }
// };