export const routingControllerOptions = {
  cors: true,
  controllers: [`${__dirname}/../controller/**/*.{js,ts}`],
  middlewares: [`${__dirname}/../middlewares/*.{js,ts}`],
  validation: false,
  // validation: {validationError: {target: false, value: false}},
  // validation이 false면 dto에서 타입 오류가 발생할 경우를 캐치할 수 없음
  // true로 해야지 타입 오류를 캐치할 수 있지만,
  // 현재 프로젝트에서 사용하고 있는 pageResList와 키값이 일치하지 않는 문제가 있음
  // 해당 부분을 해결하려면 dto단에서 사용하는 타입별로 만들어야 함
  // 더 나은 방법을 찾게 되면 반영해보기

  // routing-controllers를 사용하지 않을 경우,
  // 미들웨어로 타입과 값을 받아 일괄적으로 검토할 수 있는 방법이 있음

  // nest의 경우 정상적으로 dto 에러 캐치 가능함
};
