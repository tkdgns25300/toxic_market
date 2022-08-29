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
// :
// 4. 언스테이킹 API
// :
// 5. 정오(12:00 PM) 예약 API(람다)
// 6. 스테이킹 목록 조회 API
// 7. 스테이킹 이용 유저의 포인트 지급내역 조회 API

// 필요 테이블
// - staking
// - staking_log


// /****************************************************************************************************************************************************** */

// // {
// // 	"version": 4,
// // 	"id": "c989fb06-5645-437b-b1ae-23ae2bfdc0db",
// // 	"address": "0xf9496b7e5989647ad47bcdbe3bd79e98fb836514",
// // 	"keyring": [
// // 		{
// // 			"ciphertext": "42996f86a75c125bbdaafa6064886d366df3576a9d86b7be30289569206bcc74",
// // 			"cipherparams": {
// // 				"iv": "0e3626bc4216fa73226c53f19e7abc58"
// // 			},
// // 			"cipher": "aes-128-ctr",
// // 			"kdf": "scrypt",
// // 			"kdfparams": {
// // 				"dklen": 32,
// // 				"salt": "a0513c63941fbe7167e6eb4d7fec695938ccde5bcdaa80a0a53638eac176f11e",
// // 				"n": 4096,
// // 				"r": 8,
// // 				"p": 1
// // 			},
// // 			"mac": "bf97893fbe9b565bc5bcae2f647721e11f735973d1d41c10d02053188224710c"
// // 		}
// // 	]
// // }
// // key store파일, password를 이용해 로그인 가능(klaytn wallet key로도 로그인 가능)
// // => 로그인 했다는 거는 private key에 접근 가능하다는 거고
// // => 이 부분은 트랜젝션 생성이 가능하다는 부분임.

// // 0x6041b4636061525df35172d2f0c2fbd5554a6d4bd2e57f482f5f617c9318541b
// // : private key => 트랜젝션 서명에 필요

// // 0x6041b4636061525df35172d2f0c2fbd5554a6d4bd2e57f482f5f617c9318541b0x000xf9496b7e5989647ad47bcdbe3bd79e98fb836514
// // : klaytn wallet key 
// // => 로그인에 필요함
// // => 절대 트랜잭션 서명에 사용 X

// # Klaytn 필수 정보

// 클레이튼 지갑(메인넷)

// [https://wallet.klaytn.foundation/](https://wallet.klaytn.foundation/)

// 클레이튼 지갑(바오밥)

// [https://baobab.wallet.klaytn.foundation/](https://baobab.wallet.klaytn.foundation/)

// 클레이튼 공식 문서

// [https://ko.docs.klaytn.foundation/](https://ko.docs.klaytn.foundation/)

// 클레이튼 API 공식 문서

// [https://docs.klaytnapi.com](https://docs.klaytnapi.com/tutorial/token-history-api/th-api-token)

// 클레이튼 블록체인 네트워크의 전반적인 상황과 트랜잭션 또는 컨트랙트 정보를 볼 수 있는 서비스

// [https://scope.klaytn.com/](https://scope.klaytn.com/)

// [https://baobab.scope.klaytn.com/](https://baobab.scope.klaytn.com/)

// ---

// ### < wallet 기본 정보 >

// ```json
// key store파일, password를 이용해 로그인 가능(klaytn wallet key로도 로그인 가능)
// => 로그인 했다는 거는 private key에 접근 가능하다는 거고
// => 이 부분은 트랜젝션 생성이 가능하다는 부분임.
// ```

// ```json
// 0x6041b4636061525df35172d2f0c2fbd5554a6d4bd2e57f482f5f617c9318541b
// : private key => 트랜젝션 서명에 필요
// ```

// ```json
// 0x6041b4636061525df35172d2f0c2fbd5554a6d4bd2e57f482f5f617c9318541b0x000xf9496b7e5989647ad47bcdbe3bd79e98fb836514
// : klaytn wallet key 
// => 로그인에 필요함
// => 절대 트랜잭션 서명에 사용 X
// ```

// ---

// ### < 트랜잭션 수수료 >

// Transaction Fee : 트랜잭션 시 필요한 수수료(Gas Price * Gas Limit)

// Gas Price : 합의 노드에게 트랜잭션 처리해달라고 지불하는 돈(이더리움과 달리 항상 고정)

// Gas Limit : 트랜잭션을 처리하며 들어가는 Gas의 최대 한도 비용(트랜잭션 안에 무한 반복문이 있는 경우 Gas가 25000이 넘어가면 해당 작업 중지)

// +. klay 단위 : [https://ko.docs.klaytn.foundation/klaytn/design/klaytn-native-coin-klay](https://ko.docs.klaytn.foundation/klaytn/design/klaytn-native-coin-klay)

// +. **스마트 계약 함수를 통한 트랜젝션은 복잡성에 따라 Gas Limit이 바뀌기 때문에 Transaction Fee가 고정되어 있지 않음**

// ---

// ### < Klaytn IDE: 스마트 계약 작성 및 테스팅 환경  >

// [https://ide.klaytn.foundation/](https://ide.klaytn.foundation/)

// ---

// **AccessKey ID**

// KASKQ16BGFGCW9RWI35226AX

// **Secret AccessKey**

// bx6M89gTan48YBeFGvnLkdGEMhwL6zKLqPIcOSYt

// **Authorization**

// Basic S0FTS1ExNkJHRkdDVzlSV0kzNTIyNkFYOmJ4Nk04OWdUYW40OFlCZUZHdm5Ma2RHRU1od0w2ektMcVBJY09TWXQ=