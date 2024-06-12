import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Client from '@/models/Client';
import dbConnect from '@/lib/dbConnect';
import { Pinecone } from '@pinecone-database/pinecone';
import File from '@/models/File';
import processDocument, { deleteFilesFromIndex } from '@/lib/documentProcessorLite';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);  
    console.log(session);
    if (!session){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();
    try {
      const clients = await Client.find({ userId: session.userId });
      console.log('Getting data');
      return NextResponse.json(clients, { status: 200 });
    } catch (error) {
      console.error('Error getting data');
      return NextResponse.json({ error: 'Error getting data.' }, { status: 500 });
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

      // Initialize Pinecone API client
      const pineconeClient = new Pinecone({
        apiKey: '6232ba58-fbef-4d43-b47c-24435a166b63'
      });



      //Find all files for clientid and u
      const files = await File.find({ clientId: id });
      for (const file of files) {
        await deleteFilesFromIndex(file.name, file._id, file.clientId)
        await File.deleteOne({ _id: file._id });
        //pineconeClient.deleteIndex(file._id);
      }

      const client = await Client.findOneAndDelete({ _id: id, userId: session.userId });
      if (!client) {
        return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
      }
      console.log('Deleting data');
      //pineconeClient.deleteIndex(id);
      return NextResponse.json({ message: 'Client deleted successfully.' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting data');
      return NextResponse.json({ error: 'Error deleting data.' }, { status: 500 });
    }
  }