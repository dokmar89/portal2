import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  const { id } = await request.json();

  try {
    const docRef = doc(db, "qrVerifications", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json({ message: 'Verification found', status: docSnap.data().status }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Verification not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error fetching verification:', error.message);
    return NextResponse.json({ message: 'Error fetching verification', error: error.message }, { status: 500 });
  }
}
