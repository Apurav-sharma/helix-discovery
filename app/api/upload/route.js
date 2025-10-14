// app/api/upload/route.js
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json(
                { error: 'Filename is required' },
                { status: 400 }
            );
        }

        // Get the file from request body
        const blob = await request.blob();

        // Upload to Vercel Blob
        const uploadedBlob = await put(filename, blob, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_SXUrwYO7V6TocBtE_6BIQAIPkVpJkcHquIpNHYlIZkV5zL0",
            allowOverwrite: true
        });

        return NextResponse.json({
            url: uploadedBlob.url,
            pathname: uploadedBlob.pathname,
            contentType: uploadedBlob.contentType,
            size: uploadedBlob.size,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed', details: error.message },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};