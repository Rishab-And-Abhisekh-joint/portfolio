// app/api/auth/signup/route.ts
// Sign-up is disabled for this single-admin portfolio
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Sign-up is disabled. This is a single-admin portfolio.' },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Sign-up is disabled. This is a single-admin portfolio.' },
    { status: 403 }
  );
}
