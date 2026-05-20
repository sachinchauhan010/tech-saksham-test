import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/lib/models";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
	const accessToken = req.cookies.get("accessToken");

	if (!accessToken) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const authorizedToken = jwt.verify(
		accessToken.value,
		process.env.JWT_ACCESS_TOKEN_SECRET!
	) as { email: string; role: string[] };

	// fetch Email from Token
	const email = authorizedToken.email;
	await connectDB();

	// fetch user from database without password
	const user = await User.findOne({ email }).select("-password");

	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}

	return NextResponse.json(
		{
			success: true,
			user,
		},
		{ status: 200 }
	);
}
