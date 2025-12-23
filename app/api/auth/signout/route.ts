// app/api/auth/signout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear the session cookies
    cookieStore.delete('session_token');
    cookieStore.delete('is_authenticated');

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
