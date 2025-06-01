import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    try {
        // Try to connect to the database
        await connectToDatabase();

        // Get connection status
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        return NextResponse.json({
            status: 'ok',
            database: dbStatus,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Database connection failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 