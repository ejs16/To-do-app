import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import processZipFile from '@/lib/documentProcessorLite';
import dbConnect from '@/lib/dbConnect';
import Client from '@/models/Client';
import Task from '@/models/Task';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const taskId = url.searchParams.get('taskId');

  await dbConnect();
  const task = await Task.findOne({ 'taskId': taskId });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json({ status: task.status, percentComplete: task.percentComplete });
}