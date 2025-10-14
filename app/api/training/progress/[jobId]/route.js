// app/api/training/progress/[jobId]/route.js
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { jobId } = params;

        // Forward to Python service
        const response = await fetch(`https://helix-discovery-2.onrender.com/progress/${jobId}`);
        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch progress', message: error.message },
            { status: 500 }
        );
    }
}