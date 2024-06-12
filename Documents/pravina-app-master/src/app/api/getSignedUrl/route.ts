import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export async function POST(request: Request) {

    const session = await getServerSession(authOptions);  
    console.log(session);
    if (!session){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileType } = body;
    await dbConnect();

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: session.userId+'/'+fileName,
        Expires: 600, // Expiration time of signed URL
        ContentType: fileType
    };

    try {
        const signedUrl = await s3.getSignedUrlPromise('putObject', params);        
        return NextResponse.json({ signedUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'error getting signedUrl' }, { status: 404 });
    }
};
