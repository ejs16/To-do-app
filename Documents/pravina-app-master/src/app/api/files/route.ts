import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import File from '@/models/File'; // assuming File.js is in the same directory
import dbConnect from '@/lib/dbConnect';
import { deleteFilesFromIndex } from '@/lib/documentProcessorLite';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);  
  console.log(session);
  if (!session){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // Parse the URL and query parameters
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const cid = params.get('cid');
  const fileId = params.get('fileId');

  try {
    let files;
    if (fileId) {
      // If a fileId is provided, get that specific file
      files = await File.findOne({ _id: fileId, userId: session.userId});
    } else {
      // If no fileId is provided, get all files that match the userId and clientId
      files = await File.find({ userId: session.userId, clientId: cid });
    }
    console.log('Getting files');
    return NextResponse.json(files, { status: 200 });
  } catch (error) {
    console.error('Error getting files');
    return NextResponse.json({ error: 'Error getting files.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);  
  console.log(session);
  if (!session){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    // Assuming you're passing the id of the client to delete in the request body
    const id = (await request.json()).id;
    const file = await File.findOneAndDelete({ _id: id, userId: session.userId });

    if (file && file.indexed) {
      const deleted = await deleteFilesFromIndex(file.name, file._id, file.clientId);
    }

    if (!file) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }
    console.log('Deleting data');
    return NextResponse.json({ message: 'File deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting data');
    return NextResponse.json({ error: 'Error deleting data.' }, { status: 500 });
  }
}