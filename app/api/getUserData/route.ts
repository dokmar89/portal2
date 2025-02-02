// app/api/getUserData/route.ts
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ message: 'Authorization header is missing' }, { status: 401 });
    }
    
    const token = authorizationHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { uid } = await request.json();
    
    // Získat data uživatele přímo z Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      // Pokud uživatel neexistuje v Firestore, vytvoříme základní záznam
      const userData = {
        uid,
        email: decodedToken.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await db.collection('users').doc(uid).set(userData);
      return NextResponse.json({ data: userData }, { status: 200 });
    }
    
    return NextResponse.json({ data: userDoc.data() }, { status: 200 });
  } catch (error: any) {
    console.error('Error in getUserData:', error);
    return NextResponse.json(
      { message: 'Failed to get user data', error: error.message }, 
      { status: error.code === 'auth/invalid-token' ? 401 : 500 }
    );
  }
}
