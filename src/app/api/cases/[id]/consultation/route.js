import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));

// GET the consultation details for a specific case
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
      .populate('patientId')
      .select('transcript patientHistory patientInfo aiAnalysis createdAt');
    
    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        transcript: caseData.transcript,
        patientHistory: caseData.patientHistory,
        patientInfo: caseData.patientInfo,
        aiAnalysis: caseData.aiAnalysis,
        patient: caseData.patientId,
        createdAt: caseData.createdAt
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching consultation details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch consultation details', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH to update consultation details
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    const { patientHistory, patientInfo, aiAnalysis } = body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid case ID format' },
        { status: 400 }
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
    
    // Update fields if provided
    const updateData = {};
    
    if (patientHistory !== undefined) {
      updateData.patientHistory = patientHistory;
    }
    
    if (patientInfo !== undefined) {
      updateData.patientInfo = patientInfo;
    }
    
    if (aiAnalysis !== undefined) {
      updateData.aiAnalysis = aiAnalysis;
    }
    
    updateData.updatedAt = new Date();
    
    const updatedCase = await Case.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId');
    
    return NextResponse.json({
      success: true,
      message: 'Consultation details updated successfully',
      data: {
        transcript: updatedCase.transcript,
        patientHistory: updatedCase.patientHistory,
        patientInfo: updatedCase.patientInfo,
        aiAnalysis: updatedCase.aiAnalysis,
        patient: updatedCase.patientId,
        createdAt: updatedCase.createdAt,
        updatedAt: updatedCase.updatedAt
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating consultation details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update consultation details', error: error.message },
      { status: 500 }
    );
  }
}
