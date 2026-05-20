import { User } from "@/lib/models";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const email = searchParams.get('email');
  const phone = searchParams.get('phone');

  const filters = [];

  if (email) {
    filters.push({ email });
  }

  if (phone) {
    filters.push({ phone });
  }

  const user = await User.findOne({
    $or: filters,
  });

  if (!user) {
    return Response.json({
      success: false,
      message: 'User not found',
    });
  }

  return Response.json({
    success: true,
    data: user,
  });
}