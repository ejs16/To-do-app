import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import askQuestion from '@/lib/chatHelper';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);  
    console.log(session);
    if (!session){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const body = await request.json();
    console.log(body.q);
    
    try {
      const response = await askQuestion(body.q, body.cid);
      return NextResponse.json({ "a": response });
      console.log('Asking question');
    } catch (error) {
      console.error('Error asking question');
      return NextResponse.json({ error: 'Error asking question!' }, { status: 500 });
    }
  }