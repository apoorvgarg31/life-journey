import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getConfig, verifyPassword } from './config';

let secretCache: Uint8Array | null = null;

async function getSecret(): Promise<Uint8Array> {
  if (secretCache) return secretCache;
  const config = await getConfig();
  secretCache = new TextEncoder().encode(config.jwtSecret);
  return secretCache;
}

export async function createToken(username: string): Promise<string> {
  const secret = await getSecret();
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const secret = await getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as { username: string };
  } catch {
    return null;
  }
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  try {
    const config = await getConfig();
    return username === config.auth.username && verifyPassword(password, config.auth.passwordHash);
  } catch {
    return false;
  }
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
