import { NextResponse } from 'next/server';
import { completeConsultation } from '@/lib/db/utils/currentPatientUtils';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { 
            currentPatientId, 
            doctorId, 
            doctorName,
            doctorComments,
            prescription
        } = data;

        if (!currentPatientId || !doctorId || !doctorName) {
            return NextResponse.json({
                status: 'error',
                message: 'Missing required fields: currentPatientId, doctorId, doctorName'
            }, { status: 400 });
        }

        console.log('Complete consultation API called with data:', {
            currentPatientId,
            doctorId,
            doctorName,
            hasPrescription: !!prescription
        });

        // Complete the consultation and store all data
        const completedConsultation = await completeConsultation(
            currentPatientId,
            doctorId,
            doctorName,
            doctorComments || '',
            prescription || null
        );

        return NextResponse.json({
            status: 'success',
            data: completedConsultation,
            message: 'Consultation completed successfully'
        });
    } catch (error) {
        console.error('Error completing consultation:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Failed to complete consultation',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 