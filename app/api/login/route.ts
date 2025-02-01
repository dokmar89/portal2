import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    // Authenticate the user with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get ID token for the authenticated user
    const idToken = await user.getIdToken();

    return NextResponse.json({ message: 'Login successful', token: idToken }, { status: 200 });
  } catch (error: any) {
    console.error('Error during login:', error.message);
    return NextResponse.json({ message: 'Invalid login credentials', error: error.message }, { status: 401 });
  }
}
