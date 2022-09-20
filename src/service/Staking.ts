import Caver, { KIP17 } from "caver-js";
import axios from "axios";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NftSearchReq } from "../api/request/NftSearchReq";
import { StakingQueryRepo } from "../repository/Staking";
import { StakingContractTokenDto } from "../dto/Staking";
import { ABI, TOX_CONTRACT_ADDRESS } from "../middlewares/smartContract";
import { PageReq, PageResList, PageResObj } from "../api";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { Staking, StakingLog, User } from "../entity";
import { StakingSearchReq } from "../api/request/StakingSearchReq";
import { StakingLogSearchReq } from "../api/request/StakingLogSearchReq";
import { ErrorNFTSearchReq } from "../api/request/ErrorNFTSearchReq";
import { UserQueryRepo } from "../repository/User";
import { StakingLogQueryRepo } from "../repository/StakingLog";

const toxicNFTContractAddress = [process.env.TOXIC_APE, process.env.FOOLKATS, process.env.SUCCUBUS, process.env.TOXIC_APE_SPECIAL]
const caver = new Caver("https://public-node-api.klaytnapi.com/v1/cypress");
// const caver = new Caver('https://api.baobab.klaytn.net:8651/')

// Staking 지갑
const keyring = caver.wallet.keyring.createFromPrivateKey(
  process.env.STAKING_WALLET_PRIVATE_KEY
);
caver.wallet.add(keyring);

@Service()
export class StakingService {
  constructor(
    @InjectRepository()
    readonly stakingQueryRepo: StakingQueryRepo,
    readonly userQueryRepo: UserQueryRepo,
    readonly stakingLogQueryRepo: StakingLogQueryRepo
  ) {}

  async findUserNFT(param: NftSearchReq, public_address: string): Promise<PageResObj<any>> {
    // 유저의 모든 NFT
    let cursor = '';
    let result = [];
    do {
      const res = await axios({
        method: "get",
        url: `https://th-api.klaytnapi.com/v2/account/${[public_address]}/token?kind=nft&size=1000&ca-filters=${param.contract_address}&cursor=${cursor}`,
        headers: {
          "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
            ? process.env.KLAYTN_API_X_CHAIN_ID
            : "8217",
          Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
        },
      });
      result = result.concat(res.data.items);
      cursor = res.data.cursor;
    } while (cursor !== '')

    // Pagination
    const totalAmounts = result.length;
    result = result.slice(param.getOffset(), param.getOffset() + param.getLimit());
    
    return new PageResObj({result, totalAmounts}, "유저 NFT 조회에 성공하였습니다.");
  }

  async stakingNFT(param: StakingContractTokenDto, public_address: string): Promise<PageResObj<{}>> {
    const kip17 = new caver.kct.kip17(param.contract_address)
    // NFT전송권한 부여받았는지 확인
    const isApproved = await kip17.isApprovedForAll(public_address, process.env.STAKING_WALLET_ADDRESS)
    if (!isApproved) {
      return new PageResObj({}, "transfer 권한이 없습니다.", true);
    }
    let kindOfNFT: string;
    switch(param.contract_address.toLowerCase()) {
      case toxicNFTContractAddress[0]:
        kindOfNFT = 'toxic_ape'
        break;
      case toxicNFTContractAddress[1]:
        kindOfNFT = 'foolkat'
        break;
      case toxicNFTContractAddress[2]:
        kindOfNFT = 'succubus'
        break;
      case toxicNFTContractAddress[3]:
        kindOfNFT = 'toxic_ape_special'
        break;
      // Testing Contract_address
      case '0x9faccd9f9661dddec3971c1ee146516127c34fc1':
        kindOfNFT = 'toxic_ape'
        break;
    }
    
    // Transfer NFT and Create Staking Data AT ONCE
    const NFTAmount = kindOfNFT + '_amount'
    const stakingTimeName = kindOfNFT + '_staking_time';
    for (const tokenId of param.token_id) {
      // Transfer
      await kip17.safeTransferFrom(public_address, process.env.STAKING_WALLET_ADDRESS, tokenId, {
        from: process.env.STAKING_WALLET_ADDRESS
      })

      // Create Staking Data
      const staking = await this.stakingQueryRepo.findOne('user_address', public_address)
      if (!staking) {
        const newStaking = {
          [kindOfNFT]: tokenId,
          [stakingTimeName]: new Date().toISOString(),
          [NFTAmount]: 1,
          total_points: 0,
          user_address: public_address
        }
        await this.stakingQueryRepo.create(newStaking)
      }
      else {
        if (staking[kindOfNFT] === null || staking[kindOfNFT] === '') {
          staking[kindOfNFT] = tokenId;
          staking[stakingTimeName] = new Date().toISOString();
        } else {
          staking[kindOfNFT] += '&' + tokenId;
        staking[stakingTimeName] += '&' + new Date().toISOString();
        }
        staking[NFTAmount] += 1;
        await this.stakingQueryRepo.update(staking, 'user_address', public_address)
      }
    }

    return new PageResObj({}, "Staking에 성공하였습니다.");
    
    // // 1. transfer NFT + set staking time
    // const stakingTimeArr = []
    // for (const tokenId of param.token_id) {
    //   await kip17.safeTransferFrom(public_address, process.env.STAKING_WALLET_ADDRESS, tokenId, {
    //     from: process.env.STAKING_WALLET_ADDRESS
    //   })
    //   stakingTimeArr.push(new Date().toISOString())
    // }

    // // 2. Create Staking Data  
    // const staking = await this.stakingQueryRepo.findOne('user_address', public_address)
    // const NFTAmount = kindOfNFT + '_amount'
    // const stakingTimeName = kindOfNFT + '_staking_time';
    // // 이전에 스테이킹 했던 사용자
    // if (staking) {
    //   if (staking[kindOfNFT] === null || staking[kindOfNFT] === '') {
    //     staking[kindOfNFT] = param.token_id.join('&')
    //     staking[stakingTimeName] = stakingTimeArr.join('&')
    //   }
    //   else {
    //     staking[kindOfNFT] += '&' + param.token_id.join('&')
    //     staking[stakingTimeName] += '&' + stakingTimeArr.join('&')
    //   }
    //   staking[NFTAmount] = staking[kindOfNFT].split('&').length;
    //   await this.stakingQueryRepo.update(staking, 'user_address', public_address)
    // }
    // // 처음 스테이킹 하는 사용자
    // else {
    //   const newStaking = {
    //     [kindOfNFT]: param.token_id.join('&'),
    //     [stakingTimeName]: stakingTimeArr.join('&'),
    //     [NFTAmount]: param.token_id.length,
    //     total_points: 0,
    //     user_address: public_address
    //   }
    //   await this.stakingQueryRepo.create(newStaking)
    // }

    // return new PageResObj({}, "Staking에 성공하였습니다.");
  }

  async findUserStakingNFT(param: NftSearchReq, public_address: string): Promise<PageResObj<any>> {
    // 모든 NFT 조회
    let cursor = '';
    let result = [];
    do {
      const res = await axios({
        method: "get",
        url: `https://th-api.klaytnapi.com/v2/account/${process.env.STAKING_WALLET_ADDRESS}/token?kind=nft&size=1000&ca-filters=${param.contract_address}&cursor=${cursor}`,
        headers: {
          "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
            ? process.env.KLAYTN_API_X_CHAIN_ID
            : "8217",
          Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
        },
      });
      result = result.concat(res.data.items);
      cursor = res.data.cursor;
    } while (cursor !== '')

    // 유저의 NFT만 필터링
    result = result.filter(nft => nft.lastTransfer.transferFrom.toLowerCase() === public_address.toLowerCase())

    // Pagination
    const totalAmounts = result.length;
    result = result.slice(param.getOffset(), param.getOffset() + param.getLimit());

    return new PageResObj({ result, totalAmounts }, "유저의 스테이킹된 NFT 조회에 성공하였습니다.");
  }

  async unstakingNFT(param: StakingContractTokenDto, public_address: string): Promise<PageResObj<{}>> {
    const staking = await this.stakingQueryRepo.findOne("user_address", public_address);
    if (!staking) {
      return new PageResObj({}, "이전에 스테이킹한 기록이 없습니다.", true)
    }
    let kindOfNFT: string;
    switch(param.contract_address.toLowerCase()) {
      case toxicNFTContractAddress[0]:
        kindOfNFT = 'toxic_ape'
        break;
      case toxicNFTContractAddress[1]:
        kindOfNFT = 'foolkat'
        break;
      case toxicNFTContractAddress[2]:
        kindOfNFT = 'succubus'
        break;
      case toxicNFTContractAddress[3]:
        kindOfNFT = 'toxic_ape_special'
        break;
      // Testing Contract_address
      case '0x9faccd9f9661dddec3971c1ee146516127c34fc1':
        kindOfNFT = 'toxic_ape'
        break;
    }

    // 1. Check Staking Time
    const stakingTimeName = kindOfNFT + '_staking_time';
    const stakingTimeArr = staking[stakingTimeName].split('&');
    let isPossible = true;
    staking[kindOfNFT].split('&').forEach((tokenId: string, idx: number) => {
      if (param.token_id.includes(tokenId)) {
        const stakingTime = new Date(stakingTimeArr[idx])
        const unstakingEnableTime = new Date(stakingTime)
        unstakingEnableTime.setDate(stakingTime.getDate() + 10);
        // unstakingEnableTime.setMinutes(stakingTime.getMinutes() + 3);
        if (new Date() <= unstakingEnableTime) {
          isPossible = false;
        }
      }
    })
    if (!isPossible) {
      return new PageResObj({}, 'Staking 10일 이후부터 Unstaking이 가능합니다.', true)
    }

    // Transfer NFT and Update Staking Data AT ONCE
    const NFTAmount = kindOfNFT + '_amount'
    const kip17 = new caver.kct.kip17(param.contract_address)
    for (const tokenId of param.token_id) {
      // Transfer NFT
      await kip17.safeTransferFrom(process.env.STAKING_WALLET_ADDRESS, public_address, tokenId, {
        from: process.env.STAKING_WALLET_ADDRESS
      })

      // Update Staking Data
      const staking = await this.stakingQueryRepo.findOne('user_address', public_address)
      const newStakingTimeArr = staking[stakingTimeName].split('&')
      const newTokenIdArr = staking[kindOfNFT].split('&').filter((id, idx) => {
        if (tokenId === id) {
          newStakingTimeArr.splice(idx, 1)
          return false;
        }
      })
      staking[kindOfNFT] = newTokenIdArr.join('&');
      staking[stakingTimeName] = newStakingTimeArr.join('&');
      if (staking[kindOfNFT] === '') staking[NFTAmount] = 0
      else staking[NFTAmount] = staking[kindOfNFT].split('&').length;
      await this.stakingQueryRepo.update(staking, "user_address", public_address);
    }

    return new PageResObj({}, 'Unstaking에 성공하였습니다.')
    // // 2. transfer NFT
    // const kip17 = new caver.kct.kip17(param.contract_address)
    // for (const tokenId of param.token_id) {
    //   await kip17.safeTransferFrom(process.env.STAKING_WALLET_ADDRESS, public_address, tokenId, {
    //     from: process.env.STAKING_WALLET_ADDRESS
    //   })
    // }

    // // 3. Update Staking Data
    // const newStakingTimeArr = staking[stakingTimeName].split('&')
    // let index = -1;
    // const newTokenIdArr = staking[kindOfNFT].split('&').filter((tokenId, idx) => {
    //   index++;
    //   if(param.token_id.includes(tokenId)) {
    //     // staking time도 같이 제거
    //     newStakingTimeArr.splice(index, 1)
    //     index--;
    //     return false;
    //   }
    //   return true;
    // }).join('&');
    // staking[kindOfNFT] = newTokenIdArr;
    // staking[stakingTimeName] = newStakingTimeArr.join('&');
    // const NFTAmount = kindOfNFT + '_amount'
    // if (newTokenIdArr === '') staking[NFTAmount] = 0
    // else staking[NFTAmount] = newTokenIdArr.split('&').length;
    // await this.stakingQueryRepo.update(staking, "user_address", public_address);    

    // return new PageResObj({}, 'Unstaking에 성공하였습니다.')
  }

  @Transaction()
  async payPoint(key: string, @TransactionManager() manager: EntityManager): Promise<PageResObj<{}>> {
    if (key !== process.env.AWS_LAMBDA_AUTH_KEY) {
      return new PageResObj({}, '잘못된 접근입니다.', true)
    }

    const allStaking = await manager.query('select * from staking')
    for (const staking of allStaking) {
      // 유저에게 TP지급
      const amount = staking.toxic_ape_amount * 20 + staking.foolkat_amount * 4 + staking.succubus_amount * 10 + staking.toxic_ape_special_amount * 30;
      const user = await manager.findOne(User, staking.user_address);
      user.CF_balance += amount;
      await manager.update(User, {public_address: staking.user_address}, user);

      // Staking 업데이트
      staking.total_payments += amount;
      await manager.update(Staking, {id: staking.id}, staking);

      // 로그 생성
      const log = {
        toxic_ape_amount: staking.toxic_ape_amount,
        foolkat_amount: staking.foolkat_amount,
        succubus_amount: staking.succubus_amount,
        toxic_ape_special_amount: staking.toxic_ape_special_amount,
        payment_amount: amount,
        staking_id: staking.id
      }
      if(staking.toxic_ape_amount + staking.foolkat_amount + staking.succubus_amount + staking.toxic_ape_special_amount !== 0) {
        const stakingLog = manager.create(StakingLog, log)
        await manager.save(StakingLog, stakingLog)
      }
    }
    return new PageResObj({}, 'TP 지급에 성공하였습니다.')
  }

  async findStaking(param: StakingSearchReq): Promise<PageResList<Staking>> {
    const result = await this.stakingQueryRepo.findStaking(param);
    return new PageResList<Staking>(
        result[1],
        param.limit,
        result[0].map((el: Staking) => {
          return el;
        }),
        "Staking 목록을 찾는데 성공했습니다."
    );
  }

  async findStakingLog(param: StakingLogSearchReq): Promise<PageResList<Staking>> {
    const result = await this.stakingQueryRepo.findStakingLog(param);
    return new PageResList<Staking>(
        result[1],
        param.limit,
        result[0].map((el: Staking) => {
          return el;
        }),
        "Staking Log 목록을 찾는데 성공했습니다."
    );
  }

  async errorNFT(key: string, param: ErrorNFTSearchReq): Promise<PageResObj<{}>> {
    if (key !== process.env.KEY) {
      return new PageResObj({}, '잘못된 접근입니다.', true)
    }

    async function findStakedNFT(public_address: string, contract_address: string) {
      // 유저의 모든 NFT
      let cursor = '';
      let result = [];
      do {
        const res = await axios({
          method: "get",
          url: `https://th-api.klaytnapi.com/v2/account/${process.env.STAKING_WALLET_ADDRESS}/token?kind=nft&size=1000&ca-filters=${contract_address}&cursor=${cursor}`,
          headers: {
            "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
              ? process.env.KLAYTN_API_X_CHAIN_ID
              : "8217",
            Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
          },
        });
        result = result.concat(res.data.items);
        cursor = res.data.cursor;
      } while (cursor !== '')
     
      // 유저의 NFT만 필터링
      result = result.filter(nft => nft.lastTransfer.transferFrom.toLowerCase() === public_address.toLowerCase())
      result = result.map(nft => parseInt(nft.extras.tokenId, 16)).reverse()
      const totalAmounts = result.length;

      return { result, totalAmounts }
    }

    /**
     * 1단계 : 누락된 토큰(NFT)들의 id 파악
     */

    // 트랜스퍼 된 NFT들
    const toxic_ape_wallet = await findStakedNFT(param.public_address, process.env.TOXIC_APE)
    const foolkat_wallet = await findStakedNFT(param.public_address, process.env.FOOLKATS)
    const succubus_wallet = await findStakedNFT(param.public_address, process.env.SUCCUBUS)
    const toxic_ape_special_wallet = await findStakedNFT(param.public_address, process.env.TOXIC_APE_SPECIAL)
    
    // DB에 로그된 NFT들
    const user_staking = await this.stakingQueryRepo.findOne("user_address", param.public_address)
    const toxic_ape_DB = user_staking.toxic_ape? user_staking.toxic_ape.split('&') : []
    const foolkat_DB = user_staking.foolkat? user_staking.foolkat.split('&') : []
    const succubus_DB = user_staking.succubus? user_staking.succubus.split('&') : []
    const toxic_ape_special_DB = user_staking.toxic_ape_special? user_staking.toxic_ape_special.split('&') : []

    // 각 NFT별 로그에 없는 것들 집계
    const toxicArr = toxic_ape_wallet.result.filter(tokenId => !toxic_ape_DB.includes(String(tokenId)))
    const foolkatArr = foolkat_wallet.result.filter(tokenId => !foolkat_DB.includes(String(tokenId)))
    const succubusArr = succubus_wallet.result.filter(tokenId => !succubus_DB.includes(String(tokenId)))
    const toxicSpecialArr = toxic_ape_special_wallet.result.filter(tokenId => !toxic_ape_special_DB.includes(String(tokenId)))


    /**
     * 2단계 : 누락된 토큰들에 대해 TP지급, staking 업데이트, 로그 생성
     */
    
    // // 유저에게 TP지급
    // let amount = toxicArr.length * 20 + foolkatArr.length * 4 + succubusArr.length * 10 + toxicSpecialArr.length * 30
    // if (user_staking.id >= 1 && user_staking.id <= 298) amount *= 2;
    // if (user_staking.id >= 299 && user_staking.id <= 316) amount *= 1;
    // if (user_staking.id >= 317) amount *= 0;

    // const user = await this.userQueryRepo.findOne("public_address", param.public_address);
    // if (amount !== 0) {
    //   user.CF_balance += amount;
    //   await this.userQueryRepo.update(user, "public_address", param.public_address)
    // }

    // // staking 업데이트
    // if (amount !== 0) {
    //   user_staking.total_payments += amount;
    // }
    // if (toxicArr.length > 0) {
    //   if (user_staking.toxic_ape === null || user_staking.toxic_ape === '') {
    //     user_staking.toxic_ape = toxicArr.join('&')
    //     user_staking.toxic_ape_staking_time = new Array(toxicArr.length).fill(new Date().toISOString()).join('&')
    //   } else {
    //     user_staking.toxic_ape += '&' + toxicArr.join('&')
    //     user_staking.toxic_ape_staking_time += '&' + new Array(toxicArr.length).fill(new Date().toISOString()).join('&')
    //   }
    //   user_staking.toxic_ape_amount = user_staking.toxic_ape.split('&').length;
    // }
    // if (foolkatArr.length > 0) {
    //   if (user_staking.foolkat === null || user_staking.foolkat === '') {
    //     user_staking.foolkat = foolkatArr.join('&')
    //     user_staking.foolkat_staking_time = new Array(foolkatArr.length).fill(new Date().toISOString()).join('&')
    //   } else {
    //     user_staking.foolkat += '&' + foolkatArr.join('&')
    //     user_staking.foolkat_staking_time += '&' + new Array(foolkatArr.length).fill(new Date().toISOString()).join('&')
    //   }
    //   user_staking.foolkat_amount = user_staking.foolkat.split('&').length;
    // }
    // if (succubusArr.length > 0) {
    //   if (user_staking.succubus === null || user_staking.succubus === '') {
    //     user_staking.succubus = succubusArr.join('&')
    //     user_staking.succubus_staking_time = new Array(succubusArr.length).fill(new Date().toISOString()).join('&')
    //   } else {
    //     user_staking.succubus += '&' + succubusArr.join('&')
    //     user_staking.succubus_staking_time += '&' + new Array(succubusArr.length).fill(new Date().toISOString()).join('&')
    //   }
    //   user_staking.succubus_amount = user_staking.succubus.split('&').length;
    // }
    // if (toxicSpecialArr.length > 0) {
    //   if (user_staking.toxic_ape_special === null || user_staking.toxic_ape_special === '') {
    //     user_staking.toxic_ape_special = toxicSpecialArr.join('&')
    //     user_staking.toxic_ape_special_staking_time = new Array(toxicSpecialArr.length).fill(new Date().toISOString()).join('&')
    //   } else {
    //     user_staking.toxic_ape_special += '&' + toxicSpecialArr.join('&')
    //     user_staking.toxic_ape_special_staking_time += '&' + new Array(toxicSpecialArr.length).fill(new Date().toISOString()).join('&')
    //   }
    //   user_staking.toxic_ape_special_amount = user_staking.toxic_ape_special.split('&').length;
    // }
    // await this.stakingQueryRepo.update(user_staking, "user_address", param.public_address)

    // // 로그 생성
    // if (amount !== 0) {
    //   const log = {
    //     toxic_ape_amount: toxicArr.length,
    //     foolkat_amount: foolkatArr.length,
    //     succubus_amount: succubusArr.length,
    //     toxic_ape_special_amount: toxicSpecialArr.length,
    //     payment_amount: amount,
    //     staking_id: user_staking.id
    //   }
    //   await this.stakingLogQueryRepo.create(log)
    // }

    return new PageResObj(
			{
				toxicArr,
        foolkatArr,
        succubusArr,
        toxicSpecialArr,
        // amount,
        // user,
        // user_staking,
			},
			"리워딩에 성공하였습니다."
		);
  }
}