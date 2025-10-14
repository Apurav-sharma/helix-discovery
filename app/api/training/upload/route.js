// app/api/training/upload/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Forward to Python service
        const pythonFormData = new FormData();
        pythonFormData.append('file', file);

        const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: pythonFormData
        });

        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { error: 'Upload failed', message: error.message },
            { status: 500 }
        );
    }
}