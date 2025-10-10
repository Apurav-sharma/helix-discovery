// app/api/models/route.js
import { NextResponse } from 'next/server';

// Mock data storage (will be replaced with MongoDB later)
let models = [
    {
        id: '1',
        name: 'Protein Folding Predictor',
        type: 'classification',
        architecture: '[64, 128, 256, 1]',
        activation: 'ReLU',
        optimizer: 'Adam',
        learningRate: 0.001,
        accuracy: '96.4%',
        status: 'trained',
        totalParams: 125000,
        trainableParams: 125000,
        modelSize: '4.2 MB',
        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-10-05')
    },
    {
        id: '2',
        name: 'Drug-Target Interaction',
        type: 'regression',
        architecture: '[128, 256, 512, 1]',
        activation: 'Sigmoid',
        optimizer: 'Adam',
        learningRate: 0.0001,
        accuracy: '93.2%',
        status: 'training',
        totalParams: 450000,
        trainableParams: 450000,
        modelSize: '15.8 MB',
        createdAt: new Date('2024-10-03'),
        updatedAt: new Date('2024-10-08')
    },
    {
        id: '3',
        name: 'Genomic Variant Classifier',
        type: 'transformer',
        architecture: '[512, 1024, 2048, 1]',
        activation: 'LeakyReLU',
        optimizer: 'SGD',
        learningRate: 0.01,
        accuracy: '89.7%',
        status: 'draft',
        totalParams: 2100000,
        trainableParams: 2100000,
        modelSize: '78.5 MB',
        createdAt: new Date('2024-10-06'),
        updatedAt: new Date('2024-10-06')
    }
];

// GET - Fetch all models
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');

        let filteredModels = [...models];

        // Filter by type
        if (type && type !== 'all') {
            filteredModels = filteredModels.filter(m => m.type === type);
        }

        // Filter by status
        if (status && status !== 'all') {
            filteredModels = filteredModels.filter(m => m.status === status);
        }

        return NextResponse.json({
            success: true,
            count: filteredModels.length,
            data: filteredModels
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new model
export async function POST(request) {
    try {
        const body = await request.json();

        const newModel = {
            id: String(models.length + 1),
            name: body.name || `Model ${models.length + 1}`,
            type: body.type || 'classification',
            architecture: body.architecture || '[64, 128, 1]',
            activation: body.activation || 'ReLU',
            optimizer: body.optimizer || 'Adam',
            learningRate: body.learningRate || 0.001,
            accuracy: '0%',
            status: 'draft',
            totalParams: 0,
            trainableParams: 0,
            modelSize: '0 MB',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        models.push(newModel);

        return NextResponse.json({
            success: true,
            message: 'Model created successfully',
            data: newModel
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// PUT - Update existing model
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        const modelIndex = models.findIndex(m => m.id === id);

        if (modelIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Model not found' },
                { status: 404 }
            );
        }

        models[modelIndex] = {
            ...models[modelIndex],
            ...updates,
            updatedAt: new Date()
        };

        return NextResponse.json({
            success: true,
            message: 'Model updated successfully',
            data: models[modelIndex]
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// DELETE - Delete model
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const modelIndex = models.findIndex(m => m.id === id);

        if (modelIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Model not found' },
                { status: 404 }
            );
        }

        const deletedModel = models[modelIndex];
        models = models.filter(m => m.id !== id);

        return NextResponse.json({
            success: true,
            message: 'Model deleted successfully',
            data: deletedModel
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}