// app/api/getEshops/route.ts
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

const firestore = getFirestore();

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

    const userDocRef = firestore.doc(`users/${decodedToken.uid}`);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData && userData.role!== "contact") {
        return NextResponse.json({ message: 'Access denied. Insufficient role.' }, { status: 403 });
      }
    }

    const data = await request.json();
    const response = await fetch(`${process.env.FIREBASE_FUNCTIONS_URL}/getEshops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      return NextResponse.json({ message: 'Failed to fetch eshops', error: responseData.error }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to verify token or fetch eshops', error: error.message, stack: error.stack }, { status: 500 });
  }
}