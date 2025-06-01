import { NextResponse } from 'next/server';
import { updatePrescription } from '@/lib/db/utils/patientUtils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phoneNumber, prescriptionData, consultationId } = body;
        
        // Validate required fields
        if (!phoneNumber || !prescriptionData) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Missing required fields: phoneNumber and prescriptionData are required',
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }
        
        // Validate prescription data
        if (!prescriptionData.diagnosis || !prescriptionData.medications || !prescriptionData.recommendations) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Prescription data must contain diagnosis, medications, and recommendations',
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }
        
        const result = await updatePrescription(phoneNumber, prescriptionData, consultationId);
        
        return NextResponse.json({
            status: 'success',
            data: result,
            message: 'Prescription updated successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error updating prescription:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to update prescription',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 