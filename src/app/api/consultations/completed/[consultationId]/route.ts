import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { CompletedConsultation } from '@/lib/db/models/CompletedConsultation';

export async function GET(
    request: Request,
    { params }: { params: { consultationId: string } }
) {
    try {
        await connectToDatabase();

        const consultationId = params.consultationId;

        if (!consultationId) {
            return NextResponse.json(
                { error: 'Consultation ID is required' },
                { status: 400 }
            );
        }

        const completedConsultation = await CompletedConsultation.findById(consultationId);

        if (!completedConsultation) {
            return NextResponse.json(
                { error: 'Completed consultation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(completedConsultation);

    } catch (error) {
        console.error('Error fetching completed consultation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 