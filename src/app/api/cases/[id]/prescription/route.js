import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor'));

// GET the prescription for a specific case
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid case ID format' },
        { status: 400 }
      );
    }
    
    const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case').schema);
    const caseData = await Case.findById(id)
      .populate('prescription.doctorId', 'name specialization email')
      .select('prescription');
    
    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: caseData.prescription 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch prescription', error: error.message },
      { status: 500 }
    );
  }
}

// POST to add or update a prescription for a case
export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    const { content, doctorId } = body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid case ID format' },
        { status: 400 }
      );
    }
    
    if (!content || !doctorId) {
      return NextResponse.json(
        { success: false, message: 'Prescription content and doctor ID are required' },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }
    
    // Check if doctor exists
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor').schema);
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case').schema);
    const caseData = await Case.findById(id);
    
    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }
    
    // Update the prescription and mark the case as completed
    caseData.prescription = {
      content,
      doctorId,
      createdAt: new Date()
    };
    caseData.completed = true;
    caseData.updatedAt = new Date();
    
    await caseData.save();
    
    // Populate the doctor information in the response
    const updatedCase = await Case.findById(id)
      .populate('prescription.doctorId', 'name specialization email')
      .populate('patientId', 'name age gender');
    
    return NextResponse.json({
      success: true,
      message: 'Prescription added successfully',
      data: updatedCase
    }, { status: 200 });
  } catch (error) {
    console.error('Error adding prescription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add prescription', error: error.message },
      { status: 500 }
    );
  }
}
