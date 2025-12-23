// app/api/auth/signin/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Admin credentials - hardcoded for portfolio
const ADMIN_CREDENTIALS = {
  email: 'rishab.acharjee12345@gmail.com',
  password: '123@Rishab',
  name: 'Rishab Acharjee',
  username: 'rishab_acharjee'
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check against hardcoded admin credentials
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate a simple session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    // Also set a non-httpOnly cookie for client-side checks
    cookieStore.set('is_authenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: {
        id: 1,
        email: ADMIN_CREDENTIALS.email,
        username: ADMIN_CREDENTIALS.username,
        name: ADMIN_CREDENTIALS.name,
        profileComplete: true
      }
    });

  } catch (error: any) {
    console.error('Signin error:', error);
    
    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 401 }
    );
  }
}
