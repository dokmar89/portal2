import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    try {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const amount = paymentIntent.amount / 100; // Stripe amounts are in cents
      const companyId = paymentIntent.metadata.companyId as string; // Get companyId from metadata

      // Retrieve the wallet for the company
      const walletRef = doc(db, "wallets", companyId);
      const walletSnap = await getDoc(walletRef);

      if (!walletSnap.exists()) {
        console.error(`Wallet not found for company: ${companyId}`);
        return new NextResponse(`Wallet not found for company: ${companyId}`, { status: 400 });
      }

      const walletData = walletSnap.data();
      const currentBalance = walletData.balance || 0;

      // Update the wallet with the new balance
      const newBalance = currentBalance + amount;
      await updateDoc(walletRef, {
        balance: newBalance,
        lastUpdated: Timestamp.now(),
      });

      // Create a new transaction record
      await addDoc(collection(db, "transactions"), {
        companyId: companyId,
        amount: amount,
        type: "credit",
        status: "completed",
        createdAt: Timestamp.now(),
        details: {
          paymentIntentId: paymentIntent.id,
          description: "Credit added via Stripe",
        },
      });

      console.log(`Payment intent succeeded for company: ${companyId}, amount: ${amount}`);
      return new NextResponse(null, { status: 200 });
    } catch (error: any) {
      console.error(`Error processing payment intent: ${error.message}`);
      return new NextResponse(`Error processing payment intent: ${error.message}`, { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
