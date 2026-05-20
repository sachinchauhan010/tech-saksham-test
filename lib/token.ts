import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { cookies } from "next/headers";

interface TokenPayload {
  email: string;
  role: string[];
}

export function generateToken({
  email,
  role,
}: {
  email: string;
  role: string[];
}) {
  if (!process.env.JWT_ACCESS_TOKEN_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
    throw new Error("JWT secrets are not defined in environment variables.");
  }

  const payload: TokenPayload = {
    email,
    role,
  };

  const accessOptions: SignOptions = {
    expiresIn: "15m",
    algorithm: "HS256",
    issuer: "tech-saksham",
  };

  const refreshOptions: SignOptions = {
    expiresIn: "7d",
    algorithm: "HS256",
    issuer: "tech-saksham",
    jwtid: crypto.randomUUID(), //jwtid helps you uniquely identify a specific token.
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_TOKEN_SECRET,
    accessOptions
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    refreshOptions
  );

  return {
    accessToken,
    refreshToken,
  };
}


export async function setAuthToken(
  accessToken: string,
  refreshToken: string
) {

  const cookieStore = await cookies();
  
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
    priority: "high",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    // maxAge: 3 * 60 * 60,
    path: "/",
    priority: "high",
  });
}
