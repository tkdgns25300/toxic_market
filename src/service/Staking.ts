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
    readonly stakingQueryRepo: StakingQueryRepo
  ) {}

  async findUserNFT(param: NftSearchReq, public_address: string): Promise<PageResObj<any[]>> {
    // 유저의 모든 NFT
    let userAllNFT = await axios({
      method: "get",
      url: `https://th-api.klaytnapi.com/v2/account/${[public_address]}/token?kind=nft&size=1000&ca-filters=${param.contract_address}`,
      headers: {
        "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
          ? process.env.KLAYTN_API_X_CHAIN_ID
          : "8217",
        Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
      },
    });

    // Pagination
    const result = userAllNFT.data.items.slice(param.getOffset(), param.getOffset() + param.getLimit())
    
    return new PageResObj(result, "유저 NFT 조회에 성공하였습니다.");
  }

  async stakingNFT(param: StakingContractTokenDto, public_address: string): Promise<PageResObj<{}>> {
    const kip17 = new caver.kct.kip17(param.contract_address)
    // NFT전송권한 부여받았는지 확인
    const isApproved = await kip17.isApprovedForAll(public_address, process.env.STAKING_WALLET_ADDRESS)
    if (!isApproved) {
      return new PageResObj({}, "transfer 권한이 없습니다.", true);
    }
    let kindOfNFT: string;
    switch(param.contract_address) {
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
    }
    
    // 1. transfer NFT + set staking time
    const stakingTimeArr = []
    for (const tokenId of param.token_id) {
      await kip17.safeTransferFrom(public_address, process.env.STAKING_WALLET_ADDRESS, tokenId, {
        from: process.env.STAKING_WALLET_ADDRESS
      })
      stakingTimeArr.push(new Date().toISOString())
    }

    // 2. Create Staking Data  
    const staking = await this.stakingQueryRepo.findOne('user_address', public_address)
    const NFTAmount = kindOfNFT + '_amount'
    const stakingTimeName = kindOfNFT + '_staking_time';
    // 이전에 스테이킹 했던 사용자
    if (staking) {
      if (staking[kindOfNFT] === null || staking[kindOfNFT] === '') {
        staking[kindOfNFT] = param.token_id.join('&')
        staking[stakingTimeName] = stakingTimeArr.join('&')
      }
      else {
        staking[kindOfNFT] += '&' + param.token_id.join('&')
        staking[stakingTimeName] += '&' + stakingTimeArr.join('&')
      }
      staking[NFTAmount] = staking[kindOfNFT].split('&').length;
      await this.stakingQueryRepo.update(staking, 'user_address', public_address)
    }
    // 처음 스테이킹 하는 사용자
    else {
      const newStaking = {
        [kindOfNFT]: param.token_id.join('&'),
        [stakingTimeName]: stakingTimeArr.join('&'),
        [NFTAmount]: param.token_id.length,
        total_points: 0,
        user_address: public_address
      }
      await this.stakingQueryRepo.create(newStaking)
    }

    return new PageResObj({}, "Staking에 성공하였습니다.");

    const succubusABI = [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_symbol",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_initBaseURI",
            "type": "string"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "approved",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ApprovalForAll",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalSupply",
            "type": "uint256"
          }
        ],
        "name": "Minted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_contractAddress",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "_isApproved",
            "type": "bool"
          }
        ],
        "name": "approveContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "baseExtension",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "_isBreed",
            "type": "bool"
          }
        ],
        "name": "breed",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getApproved",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "isApprovedForAll",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "isBreeded",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "isContractApproved",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "maxSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_mintAmount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "_data",
            "type": "bytes"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_newBaseExtension",
            "type": "string"
          }
        ],
        "name": "setBaseExtension",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_newBaseURI",
            "type": "string"
          }
        ],
        "name": "setBaseURI",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_maxSupply",
            "type": "uint256"
          }
        ],
        "name": "setMaxSupply",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_miner",
            "type": "address"
          }
        ],
        "name": "setMiner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "tokenByIndex",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "tokenOfOwnerByIndex",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "tokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "walletOfOwner",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ]
    
  }

  async findUserStakingNFT(param: NftSearchReq, public_address: string): Promise<PageResObj<any[]>> {
    // 모든 NFT 조회
    const allNFT = await axios({
      method: "get",
      url: `https://th-api.klaytnapi.com/v2/account/${process.env.STAKING_WALLET_ADDRESS}/token?kind=nft&size=1000&ca-filters=${param.contract_address}`,
      headers: {
        "x-chain-id": process.env.KLAYTN_API_X_CHAIN_ID
          ? process.env.KLAYTN_API_X_CHAIN_ID
          : "8217",
        Authorization: `Basic ${process.env.KLAYTN_API_KEY}`,
      },
    });

    // 유저의 NFT만 필터링
    let result = allNFT.data.items.filter(nft => nft.lastTransfer.transferFrom.toLowerCase() === public_address.toLowerCase())

    // Pagination
    result = result.slice(param.getOffset(), param.getOffset() + param.getLimit())

    return new PageResObj(result, "유저의 스테이킹된 NFT 조회에 성공하였습니다.");
  }

  async unstakingNFT(param: StakingContractTokenDto, public_address: string): Promise<PageResObj<{}>> {
    const staking = await this.stakingQueryRepo.findOne("user_address", public_address);
    if (!staking) {
      return new PageResObj({}, "이전에 스테이킹한 기록이 없습니다.", true)
    }
    let kindOfNFT: string;
    switch(param.contract_address) {
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
        if (new Date() <= unstakingEnableTime) {
          isPossible = false;
        }
      }
    })
    if (!isPossible) {
      return new PageResObj({}, 'Staking 10일 이후부터 Unstaking이 가능합니다.', true)
    }

    // 2. transfer NFT
    const kip17 = new caver.kct.kip17(param.contract_address)
    for (const tokenId of param.token_id) {
      await kip17.safeTransferFrom(public_address, process.env.STAKING_WALLET_ADDRESS, tokenId, {
        from: process.env.STAKING_WALLET_ADDRESS
      })
    }

    // 3. Update Staking Data
    const newStakingTimeArr = staking[stakingTimeName].split('&')
    const newTokenIdArr = staking[kindOfNFT].split('&').filter((tokenId, idx) => {
      if(param.token_id.includes(tokenId)) {
        // staking time도 같이 제거
        newStakingTimeArr.splice(idx, 1)
        return false;
      }
      return true;
    }).join('&');
    staking[kindOfNFT] = newTokenIdArr;
    staking[stakingTimeName] = newStakingTimeArr.join('&');
    const NFTAmount = kindOfNFT + '_amount'
    if (newTokenIdArr === '') staking[NFTAmount] = 0
    else staking[NFTAmount] = newTokenIdArr.split('&').length;
    await this.stakingQueryRepo.update(staking, "user_address", public_address);    

    return new PageResObj({}, 'Unstaking에 성공하였습니다.')
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
        payment_amount: amount,
        staking_id: staking.id
      }
      const stakingLog = manager.create(StakingLog, log)
      await manager.save(StakingLog, stakingLog)
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
}