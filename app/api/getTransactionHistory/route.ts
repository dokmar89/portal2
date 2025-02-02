import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const authHeader = request.headers.get('Authorization') || '';
    const firebaseFunctionsUrl = process.env.FIREBASE_FUNCTIONS_URL;
    if (!firebaseFunctionsUrl) {
      throw new Error('Firebase Functions URL není definováno.');
    }
    const response = await fetch(`${firebaseFunctionsUrl}/getTransactionHistory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(data),
    });
    const responseText = await response.text();
    try {
      const responseData = JSON.parse(responseText);
      console.log("Response from getTransactionHistory function:", responseData);
      if (!response.ok) {
        console.error("Failed to fetch transaction history:", responseData);
        return NextResponse.json(responseData, { status: response.status });
      }
      return NextResponse.json(responseData);
    } catch (jsonError) {
      console.error("Chyba při parsování JSON z getTransactionHistory:", responseText);
      return NextResponse.json({ error: "Odpověď není validní JSON", details: responseText }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in getTransactionHistory route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
