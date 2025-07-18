import { config } from "@config";
import { decryptData, encryptData } from "../encrypt/encryption";
import jwt, { Secret } from "jsonwebtoken";

const secretKey: Secret = config.app.appSalt;

export type JwtPayload  = {
  id: string
  email: string
  roles?: string[]
  exp?: number
  iat?: number
}

export const generateAccessToken = async (payload: JwtPayload): Promise<string> => {
  const encryptedId = await encryptData(payload.id.toString());
  const encryptedEmail = await encryptData(payload.email);

  return jwt.sign(
    {
      id: encryptedId,
      email: encryptedEmail,
      roles: payload.roles,
    },
    secretKey,
    { expiresIn: "24h" }
  );
};

export const decryptAccessToken = async (accessToken: string): Promise<JwtPayload> => {
  const decryptJwt: any = jwt.decode(accessToken)

  const decryptedId = await decryptData(decryptJwt.id)
  const decryptedEmail = await decryptData(decryptJwt.email)

  return {
    id: decryptedId,
    email: decryptedEmail,
    roles: decryptJwt.roles,
    exp: decryptJwt.exp,
    iat: decryptJwt.iat
  }
}
