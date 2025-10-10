// app/api/models/build/route.js
import { NextResponse } from 'next/server';

// In-memory storage (replace with database later)
const models = {};

// Helper function to calculate model parameters
function calculateModelMetrics(config) {
    try {
        const layers = JSON.parse(config.architecture);

        if (!Array.isArray(layers) || layers.length === 0) {
            throw new Error('Invalid architecture format');
        }

        let totalParams = 0;
        const layerCount = layers.length;

        for (let i = 0; i < layers.length - 1; i++) {
            const currentLayer = layers[i];
            const nextLayer = layers[i + 1];
            const layerParams = (currentLayer * nextLayer) + nextLayer;
            totalParams += layerParams;
        }

        const modelSizeMB = (totalParams * 4) / (1024 * 1024);

        return {
            totalParameters: totalParams,
            trainableParameters: totalParams,
            modelSize: parseFloat(modelSizeMB.toFixed(2)),
            layers: layerCount
        };
    } catch (error) {
        throw new Error('Failed to parse architecture');
    }
}

// POST: Build a new model
export async function POST(request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.modelType || !body.architecture || !body.activationFunction ||
            !body.optimizer || !body.learningRate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate learning rate
        if (body.learningRate <= 0 || body.learningRate > 1) {
            return NextResponse.json(
                { error: 'Learning rate must be between 0 and 1' },
                { status: 400 }
            );
        }

        // Calculate model metrics
        const metrics = calculateModelMetrics(body);

        // Generate model ID
        const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store in memory
        models[modelId] = {
            modelId,
            config: body,
            metrics,
            status: 'ready',
            createdAt: new Date().toISOString()
        };

        const response = {
            success: true,
            message: 'Model built successfully',
            modelId,
            config: body,
            metrics,
            status: 'ready',
            createdAt: new Date().toISOString()
        };

        return NextResponse.json(response, { status: 201 });

    } catch (error) {
        console.error('Model build error:', error);
        return NextResponse.json(
            {
                error: 'Failed to build model',
                details: error.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// GET: Retrieve model information
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const modelId = searchParams.get('modelId');

        if (!modelId) {
            // Return all models if no ID specified
            return NextResponse.json({
                success: true,
                models: Object.values(models)
            });
        }

        // Get specific model
        const model = models[modelId];

        if (!model) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            ...model
        });

    } catch (error) {
        console.error('Model retrieval error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve model' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a model
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const modelId = searchParams.get('modelId');

        if (!modelId) {
            return NextResponse.json(
                { error: 'Model ID is required' },
                { status: 400 }
            );
        }

        if (!models[modelId]) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            );
        }

        delete models[modelId];

        return NextResponse.json({
            success: true,
            message: 'Model deleted successfully',
            modelId
        });

    } catch (error) {
        console.error('Model deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete model' },
            { status: 500 }
        );
    }
}

// PUT: Update model configuration
export async function PUT(request) {
    try {
        const body = await request.json();
        const { modelId, ...updates } = body;

        if (!modelId) {
            return NextResponse.json(
                { error: 'Model ID is required' },
                { status: 400 }
            );
        }

        if (!models[modelId]) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            );
        }

        // Recalculate metrics if architecture changed
        let metrics = models[modelId].metrics;
        if (updates.architecture) {
            metrics = calculateModelMetrics({ architecture: updates.architecture });
        }

        // Update model
        models[modelId] = {
            ...models[modelId],
            config: {
                ...models[modelId].config,
                ...updates
            },
            metrics,
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            message: 'Model updated successfully',
            ...models[modelId]
        });

    } catch (error) {
        console.error('Model update error:', error);
        return NextResponse.json(
            { error: 'Failed to update model' },
            { status: 500 }
        );
    }
}