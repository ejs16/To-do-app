import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the TypeScript interface for the file schema
interface IFile extends Document {
    _id: string;
    clientId: string;
    name: string;
    path: string;
    createdDate?: Date;
    indexed: boolean;
    location: string;
    size: number;
    userId: string;
    md5: string;
    category:string;
}

// Define the mongoose schema for the file
const fileSchema: Schema<IFile> = new mongoose.Schema({
    clientId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    indexed: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    md5: {
        type: String,
        required: false
    },
    category:{
        type:String,
        required:false
    }
});

// Define the File model
const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', fileSchema);

export default File;
