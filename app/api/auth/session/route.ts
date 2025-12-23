// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Admin user info
const ADMIN_USER = {
  id: 1,
  email: 'rishab.acharjee12345@gmail.com',
  username: 'rishab_acharjee',
  name: 'Rishab Acharjee',
  profileComplete: true,
  theme: 'ocean'
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Return admin user if authenticated
    return NextResponse.json({
      user: ADMIN_USER
    });

  } catch (error: any) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
