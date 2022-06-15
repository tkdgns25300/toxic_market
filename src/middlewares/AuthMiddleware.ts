import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entity";

require("dotenv").config();
/**
 * 헤더에서 AccessToken을 추출한다.
 * @param req
 */
export const extractAccessToken = (req: Request) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }
};

/**
 * JWT AccessToken을 체크한다.
 * @param req
 * @param res
 * @param next
 */
export const checkAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractAccessToken(req);
  let jwtPayload;
  try {
    jwtPayload = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    return res.status(401).send({ message: "유효하지 않은 토큰값입니다." });
  }

  next();
};

/**
 * JWT AccessToken을 체크한다.
 * @param req
 * @param res
 * @param next
 */
export const checkSuperAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractAccessToken(req);
  try {
    const jwtPayload = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    if (!jwtPayload.is_super) {
      throw new Error();
    }
  } catch (error) {
    return res.status(401).send({ message: "슈퍼 관리자가 아닙니다." });
  }

  next();
};

/**
 * JWT AccessToken을 만든다.
 * @param admin
 */
export const generateAccessToken = (user: User, remember: boolean) => {
  return jwt.sign(
    {
      aud: user.user_name, // 이 토큰을 사용할 수신자
    },
    process.env.JWT_TOKEN_KEY,
      { expiresIn: remember? '7d':'24h' }
  );
};
