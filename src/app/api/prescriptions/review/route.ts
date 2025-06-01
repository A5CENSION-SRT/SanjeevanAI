import { NextResponse } from 'next/server';
import { updateConsultationStatus } from '@/lib/db/utils/patientUtils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { patientId, consultationId, doctorId, status, comments } = body;

        // Validate required fields
        if (!patientId || !consultationId || !doctorId || !status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate status value
        if (status !== 'reviewed' && status !== 'completed') {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        const updatedPatient = await updateConsultationStatus(
            patientId,
            consultationId,
            doctorId,
            status,
            comments
        );

        if (!updatedPatient) {
            return NextResponse.json(
                { error: 'Patient or consultation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Consultation updated successfully',
            patient: updatedPatient
        });

    } catch (error) {
        console.error('Error updating consultation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 