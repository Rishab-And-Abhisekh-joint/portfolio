// lib/auth.ts
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from './db';
import { cookies } from 'next/headers';

const SALT_ROUNDS = 10;
const SESSION_DURATION_DAYS = 7;

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate session token
export function generateSessionToken(): string {
  return uuidv4() + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2);
}

// Create session
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  return token;
}

// Get session from token
export async function getSession(token: string) {
  const result = await query(
    `SELECT s.*, u.id as user_id, u.email, u.username, u.name, u.profile_complete, u.theme
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );

  return result.rows[0] || null;
}

// Delete session
export async function deleteSession(token: string) {
  await query('DELETE FROM sessions WHERE token = $1', [token]);
}

// Clean expired sessions
export async function cleanExpiredSessions() {
  await query('DELETE FROM sessions WHERE expires_at < NOW()');
}

// Get current user from cookies
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await getSession(sessionToken);
    
    if (!session) {
      return null;
    }

    return {
      id: session.user_id,
      email: session.email,
      username: session.username,
      name: session.name,
      profileComplete: session.profile_complete,
      theme: session.theme
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Sign up user
export async function signUp(email: string, username: string, password: string, name: string, resumeUrl?: string) {
  // Check if email already exists
  const existingEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingEmail.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Check if username already exists
  const existingUsername = await query('SELECT id FROM users WHERE username = $1', [username]);
  if (existingUsername.rows.length > 0) {
    throw new Error('Username already taken');
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  
  const result = await query(
    `INSERT INTO users (email, username, password_hash, name, resume_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, username, name, profile_complete, theme`,
    [email, username, passwordHash, name, resumeUrl || null]
  );

  const user = result.rows[0];
  
  // Create session
  const sessionToken = await createSession(user.id);

  return { user, sessionToken };
}

// Sign in user
export async function signIn(email: string, password: string) {
  // Find user
  const result = await query(
    'SELECT id, email, username, name, password_hash, profile_complete, theme FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Create session
  const sessionToken = await createSession(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      profileComplete: user.profile_complete,
      theme: user.theme
    },
    sessionToken
  };
}

// Sign out user
export async function signOut(token: string) {
  await deleteSession(token);
}

// Validate password strength
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
  }
  return { valid: true };
}

// Validate username
export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }
  if (username.length > 30) {
    return { valid: false, message: 'Username must be less than 30 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
}