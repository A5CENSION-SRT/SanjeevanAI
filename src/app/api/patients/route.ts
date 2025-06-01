import { NextResponse } from 'next/server';
import { getPatientByPhone, getPendingConsultations, createTestPatient, createPatient } from '@/lib/db/utils/patientUtils';
import connectToDatabase from '@/lib/db/mongodb';
import { Patient } from '@/lib/db/models/Patient';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const phoneNumber = searchParams.get('phone');

        await connectToDatabase();

        if (phoneNumber) {
            // Find a specific patient by phone number
            const patient = await Patient.findOne({ phoneNumber });

            if (!patient) {
                return NextResponse.json(
                    { error: 'Patient not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(patient);
        } else {
            // Get all patients
            const patients = await Patient.find().sort({ createdAt: -1 });
            return NextResponse.json(patients);
        }
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Endpoint to create test data
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, age, gender, phoneNumber, initialMessage } = body;
        
        // Validate required fields
        if (!name || !age || !gender || !phoneNumber || !initialMessage) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Missing required fields: name, age, gender, phoneNumber, and initialMessage are required',
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }
        
        // Validate age
        if (typeof age !== 'number' || age <= 0) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Age must be a positive number',
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }
        
        // Create patient
        const result = await createPatient(name, age, gender, phoneNumber, initialMessage);
        
        return NextResponse.json({
            status: 'success',
            data: result,
            message: result.isNew ? 'New patient created' : 'New consultation added to existing patient',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error creating patient:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to create patient',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 