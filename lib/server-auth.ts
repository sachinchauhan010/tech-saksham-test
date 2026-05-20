import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/lib/models";

export const getServerUser = async (req: NextRequest) => {
	const accessToken = req.cookies.get("accessToken");

	if (!accessToken) {
		return null;
	}

	try {
		const authorizedToken = jwt.verify(
			accessToken.value,
			process.env.JWT_ACCESS_TOKEN_SECRET!
		) as { email: string; role: string[] };

		const email = authorizedToken.email;
		
		// Note: The caller route should ensure connectDB() has been called
		const user = await User.findOne({ email }).select("-password");

		return user;
	} catch (error) {
		console.error("Error verifying token in getServerUser:", error);
		return null;
	}
};
