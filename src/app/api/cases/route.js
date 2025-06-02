import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));
const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient'));

// GET all cases
export async function GET() {
  try {
    await connectToDatabase();
    
    const cases = await Case.find({}).populate('patientId', 'name age gender').sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: cases }, { status: 200 });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cases', error: error.message },
      { status: 500 }
    );
  }
}

// POST to create a new case
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { patientId, transcript, patientHistory, patientInfo, aiAnalysis } = body;
    
    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid patient ID format' },
        { status: 400 }
      );
    }
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }
    
    const newCase = new Case({
      patientId,
      transcript,
      patientHistory,
      patientInfo,
      aiAnalysis,
      completed: false
    });
    
    await newCase.save();
    
    // Populate the patient information in the response
    const savedCase = await Case.findById(newCase._id).populate('patientId', 'name age gender');
    
    return NextResponse.json({
      success: true,
      message: 'Case created successfully',
      data: savedCase
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create case', error: error.message },
      { status: 500 }
    );
  }
}
