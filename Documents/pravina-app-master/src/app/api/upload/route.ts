import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import crypto from 'crypto';
import AWS from 'aws-sdk';
import Client from '@/models/Client';
import File from '@/models/File';

// Configure the AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const cid = body.cid as string;
  const s3url = body.s3Url as string;
  const fileName = body.name as string;
  const fileSize = body.fileSize as string;

  await dbConnect();
  
  const client = await Client.findOne({ _id: cid });

  if (!client) {
    return NextResponse.json({ error: 'No client found with the provided ID.' }, { status: 404 });
  }

  // Check if file exists for clientId and md5
  //const existingFile = await File.findOne({ clientId: cid, md5 });

  //if (existingFile) {
  //  return NextResponse.json({ error: 'File already exists.' }, { status: 409 });
  //}

  try {
    console.log(`File uploaded to S3: ${s3url}`);
    const url = new URL(s3url);
    const mainPartOfUrl = url.protocol + '//' + url.host + url.pathname;

    const newFile = new File({
      name: fileName,
      location: mainPartOfUrl, // Store the S3 URL
      size: fileSize,
      userId: session.userId, // replace with actual user ID
      indexed: false,
      clientId: cid,
      path: mainPartOfUrl, // Use the S3 URL
    });

    await newFile.save();
    console.log('File saved to database');

    return NextResponse.json({ s3url, id: newFile._id.toString() });
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return NextResponse.json({ error: 'Error uploading file to S3' }, { status: 500 });
  }
}
