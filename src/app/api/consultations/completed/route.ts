import { NextResponse } from 'next/server';
import { getCompletedConsultationsFromDatabase as getCompletedConsultations, getPatientCompletedConsultations } from '@/lib/db/utils/consultationUtils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const phoneNumber = searchParams.get('phone');

        let completedConsultations;

        if (phoneNumber) {
            // Get completed consultations for a specific patient
            completedConsultations = await getPatientCompletedConsultations(phoneNumber);
        } else {
            // Get all completed consultations
            completedConsultations = await getCompletedConsultations();
        }
        
        // Format response for better handling
        return NextResponse.json({
            status: 'success',
            data: completedConsultations,
            count: completedConsultations.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching completed consultations:', error);
        return NextResponse.json(
            { 
                status: 'error',
                message: 'Failed to fetch completed consultations',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 