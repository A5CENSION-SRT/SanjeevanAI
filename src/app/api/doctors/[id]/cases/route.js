import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor'));
const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));

// GET all cases assigned to a specific doctor
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const completed = searchParams.get('completed');
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }
    
    // Check if doctor exists
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor').schema);
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Build query based on parameters
    const query = { 'prescription.doctorId': id };
    
    // Add completed filter if provided
    if (completed !== null) {
      query.completed = completed === 'true';
    }
    
    // Get cases for this doctor
    const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case').schema);
    const cases = await Case.find(query)
      .populate('patientId')
      .sort({ updatedAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: cases
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctor cases:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctor cases', error: error.message },
      { status: 500 }
    );
  }
}
