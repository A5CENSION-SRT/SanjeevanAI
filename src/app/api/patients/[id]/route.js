import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient'));
const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));

// GET a specific patient by ID and their cases
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
      data: { 
        patient, 
        cases 
      } 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient and cases:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patient and cases', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH to update patient information
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid patient ID format' },
        { status: 400 }
      );
    }
    
    const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient').schema);
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedPatient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Patient updated successfully', data: updatedPatient },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update patient', error: error.message },
      { status: 500 }
    );
  }
}
