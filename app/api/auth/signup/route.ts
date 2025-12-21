// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signUp, validatePassword, validateUsername } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, name, resumeUrl } = body;

    // Validate required fields
    if (!email || !username || !password || !name) {
      return NextResponse.json(
        { error: 'Email, username, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: usernameValidation.message },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Create user
    const { user, sessionToken } = await signUp(email, username, password, name, resumeUrl);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        profileComplete: user.profile_complete
      }
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific errors
    if (error.message === 'Email already registered') {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 409 }
      );
    }
    if (error.message === 'Username already taken') {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}