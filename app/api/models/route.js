import { NextResponse } from 'next/server';
import connectDB from '@/database/connection';
import Model from '@/models/Model';

// GET - Fetch all models
export async function GET() {
    try {
        await connectDB();
        const models = await Model.find().sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            models,
        });
    } catch (error) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}

// POST - Save new model metadata
export async function POST(request) {
    try {
        await connectDB();
        const modelData = await request.json();

        const newModel = await Model.create(modelData);

        return NextResponse.json({
            success: true,
            model: newModel,
        });
    } catch (error) {
        console.error('Error saving model:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save model' },
            { status: 500 }
        );
    }
}