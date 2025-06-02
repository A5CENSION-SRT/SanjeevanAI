import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor'));

// GET all doctors
export async function GET() {
  try {
    await connectToDatabase();
    
    const doctors = await Doctor.find({}).sort({ name: 1 });
    
    return NextResponse.json({ success: true, data: doctors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctors', error: error.message },
      { status: 500 }
    );
  }
}

// POST to create a new doctor
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, specialization, experience, email, phone, availability } = body;
    
    if (!name || !specialization || !email) {
      return NextResponse.json(
        { success: false, message: 'Name, specialization, and email are required' },
        { status: 400 }
      );
    }
    
    // Check if doctor with same email exists
    const existingDoctor = await Doctor.findOne({ email });
    
    if (existingDoctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor with this email already exists' },
        { status: 400 }
      );
    }
    
    const newDoctor = new Doctor({
      name,
      specialization,
      experience,
      email,
      phone,
      availability
    });
    
    await newDoctor.save();
    
    return NextResponse.json({
      success: true,
      message: 'Doctor created successfully',
      data: newDoctor
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create doctor', error: error.message },
      { status: 500 }
    );
  }
}
