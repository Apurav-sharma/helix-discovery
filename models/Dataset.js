// models/Dataset.js
import mongoose from 'mongoose';

const DatasetSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a dataset name'],
            trim: true,
        },
        type: {
            type: String,
            required: [true, 'Please provide a dataset type'],
            uppercase: true,
        },
        size: {
            type: String,
            required: [true, 'Please provide a dataset size'],
        },
        records: {
            type: String,
            default: '0',
        },
        status: {
            type: String,
            enum: ['Processing', 'Active', 'Inactive', 'Error'],
            default: 'Processing',
        },
        filePath: {
            type: String,
            required: [true, 'Please provide a file path'],
        },
        blobUrl: {
            type: String,
            required: [true, 'Please provide a blob URL'],
        },
    },
    {
        timestamps: true,
    }
);

// Add indexes for better query performance
DatasetSchema.index({ name: 1 });
DatasetSchema.index({ type: 1 });
DatasetSchema.index({ status: 1 });
DatasetSchema.index({ createdAt: -1 });

// Prevent model recompilation in development
export default mongoose.models.Dataset || mongoose.model('Dataset', DatasetSchema);