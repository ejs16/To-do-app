import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the TypeScript interface for the task schema
interface ITask extends Document {
    status: string;
    startDate: Date;
    endDate?: Date;
    fileId: string;
    userId: string;
    percentComplete?: number;
    taskId: string;
}

// Define the mongoose schema for the task
const taskSchema: Schema<ITask> = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: false
    },
    fileId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    percentComplete: {
        type: Number,
        required: false
    },
    taskId: {
        type: String,
        required: true
    }
});

// Define the Task model
const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);

export default Task;
