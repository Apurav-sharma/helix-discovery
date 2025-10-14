// app/api/datasets/route.js
import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import connectDB from '@/database/connection';
import Dataset from '@/models/Dataset';

// GET - Fetch all datasets
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let query = {};

        if (type && type !== 'all') query.type = type;
        if (status && status !== 'all') query.status = status;
        if (search) query.name = { $regex: search, $options: 'i' };

        const datasets = await Dataset.find(query).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            count: datasets.length,
            data: datasets,
        });
    } catch (error) {
        console.error('GET /api/datasets error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Upload new dataset
export async function POST(request) {
    try {
        await connectDB();

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const token = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_SXUrwYO7V6TocBtE_6BIQAIPkVpJkcHquIpNHYlIZkV5zL0";
        if (!token) {
            console.error('Missing BLOB_READ_WRITE_TOKEN at runtime');
            return NextResponse.json({ success: false, error: 'Server missing blob token' }, { status: 500 });
        }

        const originalName = file.name || `upload-${Date.now()}`;
        const fileExt = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
        const timestamp = Date.now();
        const fileName = `datasets/${timestamp}_${originalName}`;

        // Upload to Vercel Blob Storage (pass token explicitly)
        const blob = await put(fileName, file, {
            access: 'public',
            token,
        });

        // Determine file type
        const fileType = fileExt ? fileExt.replace('.', '').toUpperCase() : 'UNKNOWN';

        // Calculate file size
        const fileSizeBytes = typeof file.size === 'number' ? file.size : 0;
        const fileSizeInMBNum = fileSizeBytes / (1024 * 1024);
        const fileSize =
            fileSizeInMBNum >= 1024
                ? `${(fileSizeInMBNum / 1024).toFixed(2)} GB`
                : `${fileSizeInMBNum.toFixed(2)} MB`;

        // Create dataset record in MongoDB
        const newDataset = await Dataset.create({
            name: originalName.replace(fileExt, ''),
            type: fileType,
            size: fileSize,
            records: '0',
            status: 'Processing',
            filePath: blob.url,
            blobUrl: blob.url,
        });

        // Simulate processing completion
        setTimeout(async () => {
            try {
                await connectDB();
                await Dataset.findByIdAndUpdate(newDataset._id, { status: 'Active' });
            } catch (error) {
                console.error('Error updating dataset status:', error);
            }
        }, 2000);

        return NextResponse.json({
            success: true,
            message: 'Dataset uploaded successfully',
            data: newDataset,
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/datasets error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// PUT - Update dataset metadata
export async function PUT(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Dataset ID is required' }, { status: 400 });
        }

        const updatedDataset = await Dataset.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!updatedDataset) {
            return NextResponse.json({ success: false, error: 'Dataset not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Dataset updated successfully',
            data: updatedDataset,
        });
    } catch (error) {
        console.error('PUT /api/datasets error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// DELETE - Delete dataset
export async function DELETE(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Dataset ID is required' }, { status: 400 });
        }

        const dataset = await Dataset.findById(id);

        if (!dataset) {
            return NextResponse.json({ success: false, error: 'Dataset not found' }, { status: 404 });
        }

        const token = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_SXUrwYO7V6TocBtE_6BIQAIPkVpJkcHquIpNHYlIZkV5zL0";
        if (!token) {
            console.error('Missing BLOB_READ_WRITE_TOKEN at runtime (DELETE)');
            // Continue to delete DB record even if token missing, but warn
        }

        // Delete from Vercel Blob Storage (pass token if available)
        if (dataset.blobUrl) {
            try {
                await del(dataset.blobUrl, { token });
            } catch (blobError) {
                console.error('Error deleting blob:', blobError);
                // Continue with DB deletion even if blob deletion fails
            }
        }

        // Delete from database
        await Dataset.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Dataset deleted successfully',
            data: dataset,
        });
    } catch (error) {
        console.error('DELETE /api/datasets error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
