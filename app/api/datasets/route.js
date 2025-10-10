// app/api/datasets/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Mock data storage (will be replaced with MongoDB later)
let datasets = [
    {
        id: '1',
        name: 'Clinical Trial Dataset 2024',
        type: 'CSV',
        size: '2.4 GB',
        records: '1.2M',
        status: 'Active',
        filePath: '/datasets/clinical_trial_2024.csv',
        uploadedAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-09-15')
    },
    {
        id: '2',
        name: 'Genomic Sequences (VCF)',
        type: 'VCF',
        size: '5.7 GB',
        records: '450K',
        status: 'Active',
        filePath: '/datasets/genomic_sequences.vcf',
        uploadedAt: new Date('2024-09-20'),
        updatedAt: new Date('2024-09-20')
    },
    {
        id: '3',
        name: 'Drug Compound Library',
        type: 'JSON',
        size: '890 MB',
        records: '87K',
        status: 'Active',
        filePath: '/datasets/drug_compounds.json',
        uploadedAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-10-01')
    }
];

// GET - Fetch all datasets
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let filteredDatasets = [...datasets];

        // Filter by type
        if (type && type !== 'all') {
            filteredDatasets = filteredDatasets.filter(d => d.type === type);
        }

        // Filter by status
        if (status && status !== 'all') {
            filteredDatasets = filteredDatasets.filter(d => d.status === status);
        }

        // Search by name
        if (search) {
            filteredDatasets = filteredDatasets.filter(d =>
                d.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        return NextResponse.json({
            success: true,
            count: filteredDatasets.length,
            data: filteredDatasets
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Upload new dataset
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Get file details
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create datasets directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'datasets');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name;
        const fileExt = path.extname(originalName);
        const fileName = `${timestamp}_${originalName}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file
        await writeFile(filePath, buffer);

        // Determine file type
        const fileType = fileExt.toUpperCase().replace('.', '');

        // Calculate file size
        const fileSizeInMB = (buffer.length / (1024 * 1024)).toFixed(2);
        const fileSize = fileSizeInMB > 1024
            ? `${(fileSizeInMB / 1024).toFixed(2)} GB`
            : `${fileSizeInMB} MB`;

        // Create dataset record
        const newDataset = {
            id: String(datasets.length + 1),
            name: originalName.replace(fileExt, ''),
            type: fileType,
            size: fileSize,
            records: '0', // Will be calculated based on file content later
            status: 'Processing',
            filePath: `/datasets/${fileName}`,
            uploadedAt: new Date(),
            updatedAt: new Date()
        };

        datasets.push(newDataset);

        // Simulate processing completion after 2 seconds
        setTimeout(() => {
            const datasetIndex = datasets.findIndex(d => d.id === newDataset.id);
            if (datasetIndex !== -1) {
                datasets[datasetIndex].status = 'Active';
            }
        }, 2000);

        return NextResponse.json({
            success: true,
            message: 'Dataset uploaded successfully',
            data: newDataset
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// PUT - Update dataset metadata
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        const datasetIndex = datasets.findIndex(d => d.id === id);

        if (datasetIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Dataset not found' },
                { status: 404 }
            );
        }

        datasets[datasetIndex] = {
            ...datasets[datasetIndex],
            ...updates,
            updatedAt: new Date()
        };

        return NextResponse.json({
            success: true,
            message: 'Dataset updated successfully',
            data: datasets[datasetIndex]
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// DELETE - Delete dataset
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const datasetIndex = datasets.findIndex(d => d.id === id);

        if (datasetIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Dataset not found' },
                { status: 404 }
            );
        }

        const deletedDataset = datasets[datasetIndex];

        // Note: File deletion from public/datasets folder can be added here later
        // For now, just remove from array
        datasets = datasets.filter(d => d.id !== id);

        return NextResponse.json({
            success: true,
            message: 'Dataset deleted successfully',
            data: deletedDataset
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}