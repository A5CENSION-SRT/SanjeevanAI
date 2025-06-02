import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient'));

// GET all patients
export async function GET() {
  try {
    await connectToDatabase();
    
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: patients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patients', error: error.message },
      { status: 500 }
    );
  }
}

// POST to create a new patient
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, age, gender, contact, email, address, medicalHistory } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Patient name is required' },
        { status: 400 }
      );
    }
    
    // Check if patient with same email exists (if email is provided)
    if (email) {
      const existingPatient = await Patient.findOne({ email });
      
      if (existingPatient) {
        return NextResponse.json(
          { success: false, message: 'Patient with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    const newPatient = new Patient({
      name,
      age,
      gender,
      contact,
      email,
      address,
      medicalHistory
    });
    
    await newPatient.save();
    
    return NextResponse.json({
      success: true,
      message: 'Patient created successfully',
      data: newPatient
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create patient', error: error.message },
      { status: 500 }
    );
  }
}
