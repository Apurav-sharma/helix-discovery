// app/api/models/build/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { modelType, architecture, activationFunction, optimizer, learningRate } = body;

        // Forward to Python service
        const response = await fetch('https://helix-discovery-2.onrender.com/models/build', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_type: modelType,
                architecture: architecture,
                activation_function: activationFunction,
                optimizer: optimizer,
                learning_rate: learningRate
            })
        });

        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to build model', message: error.message },
            { status: 500 }
        );
    }
}