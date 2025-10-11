// app/api/training/start/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { datasetId, epochs, batchSize, validationSplit, gpuEnabled } = body;

        // Forward to Python service
        const response = await fetch('http://localhost:8000/train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dataset_id: datasetId,
                epochs: epochs || 100,
                batch_size: batchSize || 32,
                validation_split: validationSplit || 0.2,
                gpu_enabled: gpuEnabled || false,
                learning_rate: 0.001
            })
        });

        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to start training', message: error.message },
            { status: 500 }
        );
    }
}