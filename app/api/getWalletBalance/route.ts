// app/api/getWalletBalance/route.ts
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export async function POST(request: Request) {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader) {
    return NextResponse.json({ message: 'Authorization header is missing' }, { status: 401 });
  }

  const token = authorizationHeader.split(' '); 

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();
    const response = await fetch(`${process.env.FIREBASE_FUNCTIONS_URL}/getWalletBalance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      return NextResponse.json({ message: 'Failed to fetch wallet balance', error: responseData.error }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to verify token or fetch wallet balance', error: error.message, stack: error.stack }, { status: 500 });
  }
}