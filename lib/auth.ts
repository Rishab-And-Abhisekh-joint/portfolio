// lib/auth.ts
import { query } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  profileComplete: boolean;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return null;
    }

    const sessionData = await getSession(sessionToken);
    
    if (!sessionData) {
      return null;
    }

    return sessionData.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export interface Session {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
}

export async function signIn(email: string, password: string): Promise<{ user: User; sessionToken: string }> {
  // Find user by email
  const result = await query(
    'SELECT id, email, username, name, password_hash, profile_complete FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Create session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store session in database
  await query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, sessionToken, expiresAt]
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      profileComplete: user.profile_complete,
    },
    sessionToken,
  };
}

export async function signOut(sessionToken: string): Promise<void> {
  await query('DELETE FROM sessions WHERE token = $1', [sessionToken]);
}

export async function getSession(sessionToken: string): Promise<{ user: User; session: Session } | null> {
  const result = await query(
    `SELECT s.id as session_id, s.user_id, s.token, s.expires_at,
            u.id, u.email, u.username, u.name, u.profile_complete
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [sessionToken]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    user: {
      id: row.id,
      email: row.email,
      username: row.username,
      name: row.name,
      profileComplete: row.profile_complete,
    },
    session: {
      id: row.session_id,
      userId: row.user_id,
      token: row.token,
      expiresAt: row.expires_at,
    },
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
