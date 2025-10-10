// app/api/datasets/upload/route.js
import { NextResponse } from 'next/server';

// In-memory storage (replace with database later)
const datasets = {};

// POST: Upload dataset
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const name = formData.get('name');
        const description = formData.get('description');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['text/csv', 'application/json', 'application/vnd.apache.parquet',
            'text/plain', 'application/octet-stream'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['csv', 'json', 'parquet', 'vcf', 'fastq'];

        if (!allowedExtensions.includes(fileExtension)) {
            return NextResponse.json(
                { error: `File type not supported. Allowed: ${allowedExtensions.join(', ')}` },
                { status: 400 }
            );
        }

        // Generate dataset ID
        const datasetId = `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Get file size
        const fileSize = file.size;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

        // Estimate record count (mock)
        const estimatedRecords = Math.floor(Math.random() * 1000000) + 10000;

        // Store dataset metadata
        const dataset = {
            datasetId,
            name: name || file.name,
            description: description || 'Uploaded dataset',
            filename: file.name,
            type: fileExtension.toUpperCase(),
            size: `${fileSizeMB} MB`,
            sizeBytes: fileSize,
            records: estimatedRecords.toLocaleString(),
            status: 'active',
            uploadedAt: new Date().toISOString()
        };

        datasets[datasetId] = dataset;

        return NextResponse.json({
            success: true,
            message: 'Dataset uploaded successfully',
            ...dataset
        }, { status: 201 });

    } catch (error) {
        console.error('Dataset upload error:', error);
        return NextResponse.json(
            {
                error: 'Failed to upload dataset',
                details: error.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// GET: Get all datasets
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const datasetId = searchParams.get('datasetId');

        if (datasetId) {
            const dataset = datasets[datasetId];

            if (!dataset) {
                return NextResponse.json(
                    { error: 'Dataset not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                ...dataset
            });
        }

        // Return all datasets
        return NextResponse.json({
            success: true,
            datasets: Object.values(datasets)
        });

    } catch (error) {
        console.error('Dataset retrieval error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve datasets' },
            { status: 500 }
        );
    }
}

// DELETE: Delete dataset
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const datasetId = searchParams.get('datasetId');

        if (!datasetId) {
            return NextResponse.json(
                { error: 'Dataset ID is required' },
                { status: 400 }
            );
        }

        if (!datasets[datasetId]) {
            return NextResponse.json(
                { error: 'Dataset not found' },
                { status: 404 }
            );
        }

        delete datasets[datasetId];

        return NextResponse.json({
            success: true,
            message: 'Dataset deleted successfully',
            datasetId
        });

    } catch (error) {
        console.error('Dataset deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete dataset' },
            { status: 500 }
        );
    }
}