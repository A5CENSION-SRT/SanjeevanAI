import { NextResponse } from 'next/server';
import { getCurrentPatients } from '@/lib/db/utils/currentPatientUtils';

export async function GET() {
    try {
        const currentPatients = await getCurrentPatients();
        
        // Process the current patients data to ensure compatibility with UI components
        const processedPatients = currentPatients.map((patient: any) => {
            // Keep the MongoDB _id for reference
            const originalId = patient._id ? patient._id.toString() : null;
            
            // Make sure we have all the required fields for the CurrentPatient model
            return {
                ...patient,
                _id: originalId, // Ensure _id is always a string
                
                // If there's an n8n format patient name that doesn't match our schema
                patientName: patient.patientName || patient.name || 'Unknown',
                patientAge: patient.patientAge || patient.age || 0,
                patientGender: patient.patientGender || patient.gender || 'Unknown',
                patientPhone: patient.patientPhone || patient.contact || patient.phoneNumber || '',
                
                // Preserve any extra fields from the n8n workflow
                conversation: patient.conversation || '',
                medicalHistory: patient.medicalHistory || '',
                postDocReport: patient.postDocReport || '',
                preDocReport: patient.preDocReport || '',
                
                // Ensure we have an AI summary from any available source
                aiSummary: patient.aiSummary || patient.medicalHistory || patient.postDocReport || 'No summary available',
                
                // Make sure created date and last updated are always available
                lastUpdated: patient.lastUpdated || patient.createdAt || new Date(),
                consultationDate: patient.consultationDate || patient.createdAt || new Date(),
                
                // Default status if not provided
                status: patient.status || 'active'
            };
        });
        
        return NextResponse.json({
            status: 'success',
            data: processedPatients,
            count: processedPatients.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching current patients:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to fetch current patients',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 