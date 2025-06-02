import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));
const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient'));
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor'));

// GET a specific case by ID
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
    
    const caseData = await Case.findById(id)
      .populate('patientId')
      .populate('prescription.doctorId');
    
    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: caseData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch case', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH to update a case with prescription and mark as completed
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    const { prescription, doctorId } = body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid case ID format' },
        { status: 400 }
      );
    }
    
    if (!prescription || !doctorId) {
      return NextResponse.json(
        { success: false, message: 'Prescription content and doctor ID are required' },
        { status: 400 }
      );
    }
    
    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        'prescription.content': prescription,
        'prescription.doctorId': doctorId,
        'prescription.createdAt': new Date(),
        completed: true,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId').populate('prescription.doctorId');
    
    if (!updatedCase) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Case updated successfully', data: updatedCase },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update case', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a case
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid case ID format' },
        { status: 400 }
      );
    }
    
    const deletedCase = await Case.findByIdAndDelete(id);
    
    if (!deletedCase) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Case deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting case:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete case', error: error.message },
      { status: 500 }
    );
  }
}
