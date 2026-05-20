import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt, { SignOptions } from "jsonwebtoken";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const accessOptions: SignOptions = {
    expiresIn: "15m",
    algorithm: "HS256",
    issuer: "tech-saksham",
  };

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  try {
    // 1. Verify the Refresh Token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET!) as { email: string, role: string[] };

    // 2. Generate a NEW Access Token
    const newAccessToken = jwt.sign(
      { email: decoded.email, role: decoded.role },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      accessOptions
    );

    // 3. Update the Access Token Cookie
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
      priority: "high",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Invalid refresh token" }, { status: 403 });
  }
}