// app/api/models/route.js
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Forward to Python service
        const response = await fetch('http://localhost:8000/models');
        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch models', message: error.message },
            { status: 500 }
        );
    }
}