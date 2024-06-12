import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import processDocument, { deleteFilesFromIndex } from '@/lib/documentProcessorLite';
import dbConnect from '@/lib/dbConnect';
import File from '@/models/File';

let processingTasks = new Set();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);  
  console.log(session);
  if (!session){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  console.log(body.id);

  await dbConnect();
  const file = await File.findOne({ _id: body.id });
  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const deleted = await deleteFilesFromIndex(file.clientId, file.name, file._id);

  return NextResponse.json({ deleted });
}

