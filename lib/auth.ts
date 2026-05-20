import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET || 'dev-secret-key';

export async function createAdminSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHmac('sha256', SESSION_TOKEN_SECRET)
    .update(token)
    .digest('hex');

  const cookieStore = await cookies();
  cookieStore.set('admin_session', hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function validateAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value || null;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return !!session;
}

// User authentication helpers
export async function getUserSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('user_session')?.value || null;
  console.log('getUserSession - session exists:', !!session);
  return session;
}

export async function getUserInfo(): Promise<{ userId: string; email: string; name: string; role: string[] } | null> {
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get('user_info')?.value;
  console.log('getUserInfo - user_info cookie exists:', !!userInfoCookie);

  if (!userInfoCookie) return null;

  try {
    const parsed = JSON.parse(userInfoCookie);
    console.log('getUserInfo - parsed user info:', parsed);
    return parsed;
  } catch (error) {
    console.error('getUserInfo - JSON parse error:', error);
    return null;
  }
}

export async function isUserAuthenticated(): Promise<boolean> {
  const session = await getUserSession();
  console.log('isUserAuthenticated - session valid:', !!session);
  return !!session;
}

export async function clearUserSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
  } catch (error) {
    console.error('clearUserSession - error:', error);
  }
}

export async function createUserSession(user: { userId: string; email: string; name: string; role: string[] }) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHmac('sha256', SESSION_TOKEN_SECRET)
    .update(token)
    .digest('hex');

  const cookieStore = await cookies();
  cookieStore.set('user_session', hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  cookieStore.set('user_info', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export function isAuthanticated(): boolean {
  return true;
}

export function generateUserId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `GOV-${year}-${randomNum}`;
}

export const getDefaultPassword = (name: string, phone: string) => {
  // take name 3 letter and then phone last 6
  const namePart = name.substring(0, 3);
  const phonePart = phone.slice(-6);
  return `${namePart}${phonePart}`;
}

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  return isPasswordValid;
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


    // const defaultPassword = 'default-password-' + Date.now();
    // const hashedPassword = hashPassword(password || defaultPassword);
    // const newUser = new User({
    //   userId,
    //   name,
    //   email,
    //   phone,
    //   department,
    //   password: hashedPassword, // Store hashed password for backward compatibility
    // });
