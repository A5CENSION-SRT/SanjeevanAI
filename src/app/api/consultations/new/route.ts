import { NextResponse } from 'next/server';
import { createNewConsultation } from '@/lib/db/utils/consultationUtils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phoneNumber, initialMessage } = body;

        // Validate required fields
        if (!phoneNumber || !initialMessage) {
            return NextResponse.json(
                { error: 'Missing required fields. Need phoneNumber and initialMessage.' },
                { status: 400 }
            );
        }

        const updatedPatient = await createNewConsultation(
            phoneNumber,
            initialMessage
        );

        if (!updatedPatient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'New consultation created successfully',
            patient: updatedPatient
        });

    } catch (error) {
        console.error('Error creating new consultation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 