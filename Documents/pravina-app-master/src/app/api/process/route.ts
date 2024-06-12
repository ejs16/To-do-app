import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { promises as fs, stat } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import processDocument from '@/lib/documentProcessorLite';
import dbConnect from '@/lib/dbConnect';
import Client from '@/models/Client';
import File from '@/models/File';
import Task from '@/models/Task';
import { v4 as uuidv4 } from 'uuid';

let processingTasks = new Set();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);  
  console.log(session);
  if (!session){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  console.log(body.id);

  // Check if a task is already being processed for this client
  if (processingTasks.has(body.id)) {
    return NextResponse.json({ error: 'Task already being processed for this file' }, { status: 409 });
  }

  // Add the client id to the processingTasks set
  processingTasks.add(body.id);

  await dbConnect();
  const file = await File.findOne({ _id: body.id });
  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const tasks = await Task.find({ fileId: body.id, status: 'processing'});
  if (tasks.length > 0) {
    return NextResponse.json({ taskId: tasks[0].id });
  }
  
  const taskId = uuidv4();  // Generate a unique process ID

  // Kick off the process without waiting for it to complete
  processDocument(file.path, body.clientId, session.userId, taskId, body.id)
    .catch(error => {
      console.error('Error processing file:', error);
      // You might want to store the error in the database associated with the processId
    })
    .finally(() => {
      // Remove the client id from the processingTasks set when the processing is done
      processingTasks.delete(body.id);
    });

  return NextResponse.json({ taskId });
}

