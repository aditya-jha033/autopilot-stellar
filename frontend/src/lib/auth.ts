import { SignJWT, jwtVerify } from "jose";

// Need to make sure the JWT_SECRET is available
const secretKey = process.env.JWT_SECRET || "fallback-secret-for-development-only";
const encodedKey = new TextEncoder().encode(secretKey);

export async function signToken(payload: { publicKey: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token valid for 7 days
    .sign(encodedKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as { publicKey: string; iat: number; exp: number };
  } catch (error) {
    return null;
  }
}
