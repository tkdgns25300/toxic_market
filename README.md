# TOXIC MARKET PLACE SERVER
Steps to run this project:
1. Run `npm i` command
2. Setup database settings inside `ormconfig.ts` file
3. Run `npm start` command

## Server
https://api.toxicnara.com

## Swagger
https://api.toxicnara.com/api-docs/#





user.findAll에서 다음과 같이 리턴함
    const result = await this.userQueryRepo.search(param);
    return new PageResList<User>(
      result[1],
      param.limit,
      result[0].map((el: User) => {
        return el;
      }),
      "User 목록을 찾는데 성공했습니다."
    );
  }


여기에서 PageResList<User> 3번째 인자값이 items: T[] 로 정의되어 있음

result가 repository에서 getManyAndCount로 리런하는데 리턴 타입이 Promise<[Array<any>, number]>로 되어 있음

여기에서 findAll에 위처럼 map을 굳이 써야하는 의문이 들었음

일단 콘솔 상에서는 기존의 코드롤 리턴을 받아봤을 때와 map을 하지 않고 result[0]을 넘겼을 때와 동일하게 출력되는 것을 확인했음

이게 기존의 코드 콘솔 값
이거는 서비스에서의 result : [
  [
    User {
      public_address: '0x0034daa364f2cd970f74cb7d413b9db4a93a5e46',
      nonce: '803661',
      CF_balance: 0,
      is_seller: 'X',
      is_admin: 'X',
      email: null,
      store_name: null,
      phone: null,
      name: 'sangkwon',
      verify_file_url: null,
      address: null,
      seller_type: null,
      id: null,
      passwordHash: null,
      agreeRaffleService: 'X'
    }
  ],
  1
]
이거는 controller에서의 result : PageResList {
  error: false,
  totalCount: 1,
  totalPage: 1,
  msg: 'User 목록을 찾는데 성공했습니다.',
  items: [
    User {
      public_address: '0x0034daa364f2cd970f74cb7d413b9db4a93a5e46',
      nonce: '803661',
      CF_balance: 0,
      is_seller: 'X',
      is_admin: 'X',
      email: null,
      store_name: null,
      phone: null,
      name: 'sangkwon',
      verify_file_url: null,
      address: null,
      seller_type: null,
      id: null,
      passwordHash: null,
      agreeRaffleService: 'X'
    }
  ]
}


이게 result[0]의 콘솔 값
이거는 서비스에서의 result : [
  [
    User {
      public_address: '0x0034daa364f2cd970f74cb7d413b9db4a93a5e46',
      nonce: '803661',
      CF_balance: 0,
      is_seller: 'X',
      is_admin: 'X',
      email: null,
      store_name: null,
      phone: null,
      name: 'sangkwon',
      verify_file_url: null,
      address: null,
      seller_type: null,
      id: null,
      passwordHash: null,
      agreeRaffleService: 'X'
    }
  ],
  1
]
이거는 controller에서의 result : PageResList {
  error: false,
  totalCount: 1,
  totalPage: 1,
  msg: 'User 목록을 찾는데 성공했습니다.',
  items: [
    User {
      public_address: '0x0034daa364f2cd970f74cb7d413b9db4a93a5e46',
      nonce: '803661',
      CF_balance: 0,
      is_seller: 'X',
      is_admin: 'X',
      email: null,
      store_name: null,
      phone: null,
      name: 'sangkwon',
      verify_file_url: null,
      address: null,
      seller_type: null,
      id: null,
      passwordHash: null,
      agreeRaffleService: 'X'
    }
  ]
}


서버 응답 결과도 동일하며 이외 타입에러가 발생하진 않음
=> 어떤 사항으로 저렇게 구현하는 지 여부가 궁금합니다.
