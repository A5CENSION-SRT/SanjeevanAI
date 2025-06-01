import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor'));
const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));

// GET a specific doctor by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }
    
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor').schema);
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: doctor }, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctor', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH to update doctor information
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }
    
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor').schema);
    
    // If email is being updated, check if it already exists
    if (body.email) {
      const existingDoctor = await Doctor.findOne({ email: body.email, _id: { $ne: id } });
      if (existingDoctor) {
        return NextResponse.json(
          { success: false, message: 'Another doctor with this email already exists' },
          { status: 409 }
        );
      }
    }
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedDoctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Doctor updated successfully', data: updatedDoctor },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating doctor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update doctor', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a doctor
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }
    
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor').schema);
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    
    if (!deletedDoctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Doctor deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete doctor', error: error.message },
      { status: 500 }
    );
  }
}
