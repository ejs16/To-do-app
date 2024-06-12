import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcrypt';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to the users collection
    const newUserParams = {
      name,
      email,
      password: hashedPassword,
    };

    await dbConnect();
    const newUser = new User(newUserParams);
    await newUser.save();
    console.log('User registered successfully');
    return NextResponse.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user');
    return NextResponse.json({ error: 'Error registering user' }, { status: 500 });
  }
}
