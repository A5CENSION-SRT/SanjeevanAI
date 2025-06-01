import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient'));
const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));

// GET all cases for a specific patient
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid patient ID format' },
        { status: 400 }
      );
    }
    
    // Check if patient exists
    const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient').schema);
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Get all cases for this patient
    const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case').schema);
    const cases = await Case.find({ patientId: id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: cases
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient cases:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patient cases', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new case for a specific patient
export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    const { transcript, patientHistory, patientInfo, aiAnalysis } = body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid patient ID format' },
        { status: 400 }
      );
    }
    
    // Check if patient exists
    const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient').schema);
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }
    
    if (!transcript) {
      return NextResponse.json(
        { success: false, message: 'Transcript is required' },
        { status: 400 }
      );
    }
    
    // Create a new case for this patient
    const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case').schema);
    const newCase = new Case({
      patientId: id,
      transcript,
      patientHistory: patientHistory || '',
      patientInfo: patientInfo || {},
      aiAnalysis: aiAnalysis || '',
      completed: false
    });
    
    await newCase.save();
    
    return NextResponse.json(
      { success: true, message: 'Case created successfully', data: newCase },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating patient case:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create patient case', error: error.message },
      { status: 500 }
    );
  }
}
