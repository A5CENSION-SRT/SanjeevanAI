import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Patient } from '@/lib/db/models/Patient';
import { CurrentPatient } from '@/lib/db/models/CurrentPatient';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const consultationId = params.id;
    
    if (!consultationId) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      );
    }
    
    // First, try to find the current patient record
    const currentPatient = await CurrentPatient.findOne({
      _id: consultationId
    });
    
    if (!currentPatient) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }
    
    // Find the patient record to get the chat history
    const patient = await Patient.findById(currentPatient.patientId);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Find the specific consultation in the patient's consultations array
    const consultation = patient.consultations.id(currentPatient.consultationId);
    
    if (!consultation) {
      return NextResponse.json(
        { error: 'Chat history not found' },
        { status: 404 }
      );
    }
    
    // Return the chat history
    return NextResponse.json({
      status: 'success',
      aiChat: consultation.aiChat || []
    });
    
  } catch (error) {
    console.error('Error fetching consultation chat:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to fetch chat history',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 