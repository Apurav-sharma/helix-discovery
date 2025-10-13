// app/api/models/[modelId]/route.js
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { modelId } = params;

        // Forward to Python service
        const response = await fetch(`https://helix-discovery-2.onrender.com/models/${modelId}`);
        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch model info', message: error.message },
            { status: 500 }
        );
    }
}