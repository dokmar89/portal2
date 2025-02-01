import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import * as admin from 'firebase-admin';

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
    const response = await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL}/generateInvoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const responseData = await response.json();
      return NextResponse.json({ message: 'Failed to generate invoice from function', error: responseData.error }, { status: 500 });
    }
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', response.headers.get('Content-Disposition') || 'attachment; filename="invoice.pdf"');
    return new NextResponse(buffer, { status: 200, headers });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ message: 'Failed to verify token', error: error.message }, { status: 401 });
  }
}
