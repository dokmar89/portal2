// app/api/getMethodRatio/route.ts
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

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
    const response = await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL}/getMethodRatio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      return NextResponse.json({ message: 'Failed to fetch method ratio', error: responseData.error }, { status: 500 });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to verify token', error: error.message }, { status: 401 });
  }
}