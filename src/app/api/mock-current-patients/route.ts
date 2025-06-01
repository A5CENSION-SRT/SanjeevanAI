import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Sample mock data for testing
    const mockCurrentPatients = [
      {
        _id: '65f9c7a09d5b2e001f8e6b01',
        patientId: '65f9c7a09d5b2e001f8e6b02',
        patientName: 'Raj Kumar',
        patientAge: 45,
        patientGender: 'Male',
        patientPhone: '9876543210',
        consultationId: '65f9c7a09d5b2e001f8e6b03',
        aiSummary: 'Patient complains of persistent cough for 2 weeks with mild fever. History of asthma.',
        status: 'active',
        consultationDate: new Date(),
        lastUpdated: new Date(),
        prescription: null
      },
      {
        _id: '65f9c7a09d5b2e001f8e6b04',
        patientId: '65f9c7a09d5b2e001f8e6b05',
        patientName: 'Sunita Sharma',
        patientAge: 32,
        patientGender: 'Female',
        patientPhone: '8765432109',
        consultationId: '65f9c7a09d5b2e001f8e6b06',
        aiSummary: 'Patient reports headaches, dizziness and nausea for the past 3 days. No prior history of migraines.',
        status: 'active',
        consultationDate: new Date(),
        lastUpdated: new Date(),
        prescription: null
      },
      {
        _id: '65f9c7a09d5b2e001f8e6b07',
        patientId: '65f9c7a09d5b2e001f8e6b08',
        patientName: 'Arjun Singh',
        patientAge: 28,
        patientGender: 'Male',
        patientPhone: '7654321098',
        consultationId: '65f9c7a09d5b2e001f8e6b09',
        aiSummary: 'Patient experiencing joint pain in knees and ankles, especially after physical activity. Has family history of arthritis.',
        status: 'active',
        consultationDate: new Date(),
        lastUpdated: new Date(),
        prescription: null
      }
    ];
    
    return NextResponse.json({
      status: 'success',
      data: mockCurrentPatients,
      count: mockCurrentPatients.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching mock current patients:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch mock current patients',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 