import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import * as admin from 'firebase-admin';

// Inicializace Firebase Admin SDK - jen pokud neexistuje
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export async function POST(request: Request) {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader) {
    return NextResponse.json({ message: 'Authorization header is missing' }, { status: 401 });
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    const data = await request.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL}/addEshop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    if (!response.ok) {
      return NextResponse.json({ message: 'Failed to add eshop from function', error: responseData.error }, { status: 500 });
    }
    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ message: 'Failed to verify token', error: error.message }, { status: 401 });
  }
}
