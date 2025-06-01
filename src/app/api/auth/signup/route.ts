import { NextResponse } from 'next/server';
import { Doctor } from '@/lib/db/models/Doctor';
import connectToDatabase from '@/lib/db/mongodb';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { name, email, password, specialization, qualification, phone } = await request.json();
    
    // Validate required fields
    if (!name || !email || !password || !specialization) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Name, email, password, and specialization are required' 
        }, 
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    
    if (existingDoctor) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Email already in use' 
        }, 
        { status: 409 }
      );
    }
    
    // Create new doctor
    const doctor = new Doctor({
      name,
      email: email.toLowerCase(),
      password,
      specialization,
      qualification: qualification || '',
      phone: phone || '',
    });
    
    await doctor.save();
    
    return NextResponse.json({
      status: 'success',
      message: 'Doctor registered successfully',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'An error occurred during registration' 
      }, 
      { status: 500 }
    );
  }
} 