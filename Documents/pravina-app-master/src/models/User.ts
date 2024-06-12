import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the TypeScript interface for the user schema
interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    createdAt?: Date;
}

// Define the mongoose schema for the user
const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Define the User model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
