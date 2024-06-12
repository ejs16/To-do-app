import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the TypeScript interface for the client schema
interface IClient extends Document {
    first: string;
    last: string;
    letterType: string;
    tmpFileLocation: string;
    userId: string;
    createdDate?: Date;
}

// Define the mongoose schema for the client
const clientSchema: Schema<IClient> = new mongoose.Schema({
    first: {
        type: String,
        required: true
    },
    last: {
        type: String,
        required: true
    },
    letterType: {
        type: String,
        required: true
    },
    tmpFileLocation: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

// Define the Client model
const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);

export default Client;
