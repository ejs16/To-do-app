import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Client from '@/models/Client';
import generateClientFolder from '@/lib/fileHelper';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.clientId !== '') {
    try {
      await dbConnect();
      const params = {
        first: body.first,
        last: body.last,
        letterType: body.letterType,
        userId: session.userId,
      };
      const updatedClient = await Client.findByIdAndUpdate(body.clientId, params, { new: true });

      if (updatedClient) {
        return NextResponse.json(updatedClient._id, { status: 200 });
      } else {
        return NextResponse.json({ error: 'No client found with the provided ID.' }, { status: 404 });
      }
    }
    catch (error) {
      console.error('Error updating data');
      return NextResponse.json({ error: 'Error updating data.' }, { status: 500 });
    }
  }
  else {
    if (body.uploadedFilePath === '') {
      body.uploadedFilePath = await generateClientFolder();
    }

    try {
      const params = {
        first: body.first,
        last: body.last,
        letterType: body.letterType,
        tmpFileLocation: body.uploadedFilePath,
        userId: session.userId,
        createdDate: new Date(),
      };

      await dbConnect();
      const client = new Client(params);
      const result = await client.save();
      console.log('Saving data');
      return NextResponse.json(result._id, { status: 200 });
    } catch (error) {
      console.error('Error saving data');
      return NextResponse.json({ error: 'Error saving data.' }, { status: 500 });
    }
  }
}