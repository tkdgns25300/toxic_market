import crypto from "crypto";
require("dotenv").config();

export const hash = (password: string) => {
  return crypto
    .createHash("sha512")
    .update(`${process.env.CRYPTO_HASH}${password}${process.env.CRYPTO_KEY}`)
    .digest("base64");
};
