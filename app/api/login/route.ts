// app/api/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Tento endpoint již není potřeba – přihlašování se provádí na klientské straně pomocí Firebase Auth.
  return NextResponse.json({ message: 'Login endpoint is deprecated. Please use client-side authentication.' }, { status: 400 });
}
