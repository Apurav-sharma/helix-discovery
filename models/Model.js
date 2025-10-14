import mongoose from 'mongoose';

const ModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    domain: {
        type: String,
        required: true,
    },
    format: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    downloadUrl: {
        type: String,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
    },
    inputExample: {
        type: String,
    },
    outputExample: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Model || mongoose.model('Model', ModelSchema);