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




배너 관련 로직
1. 배너 저장하는 엔티티 생성
  저장된 이미지 url, 대체 텍스트, 이동할 페이지, (파일 사이즈? => 가로 세로 여부?)

2. 배너 저장 시 이미지 업로드 후 배너 엔티티 저장

3. 배너 조회 => 가로, 세로 배너 리턴

4. 배너 수정 => 배너 갯수에 따라 다르겠지만,
  1개일 경우, 요청이 들어왔는데 기존의 이미지와 url이 다르면
  기존의 이미지 삭제(s3, 테이블)

  이미지 url이 같다면 이동할 페이지만 수정

  새로운 이미지 s3 저장 및 테이블 저장

5. 베너 수정여부 검토 필요 (무조건 삭제, 새로운 배너 생성?)

6. 람다를 이용해서 이미지 리사이징 기능 고려 // https://2donny-world.tistory.com/20
  관리자가 사이즈가 일치하는 이미지를 올릴 수 있을 지 여부가 정확하지 않기 때문에
  사진의 사이즈를 가로. 세로 별로 맞출 수 있다면


