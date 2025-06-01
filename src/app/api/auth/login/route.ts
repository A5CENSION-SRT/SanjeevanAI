import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Doctor } from '@/lib/db/models/Doctor';
import connectToDatabase from '@/lib/db/mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'sanjeevini-doctor-portal-secret';

// Demo user for development testing when MongoDB is not available
const DEMO_USER = {
  _id: '65f8c7a09d5b2e001f8e6b58',
  name: 'Dr. Sanjeev Kumar',
  email: 'demo@example.com',
  password: '$2a$10$Oub0x1ZM9JDTfNrfODZbguM9KHqnNq1QhVkdxOf8Z9clK1KZ8jhYm', // hashed 'password123'
  specialization: 'General Physician',
  isAdmin: true
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Email and password are required' 
        }, 
        { status: 400 }
      );
    }
    
    // Demo login for development (allows login with demo@example.com/password123)
    if (email.toLowerCase() === DEMO_USER.email) {
      const isPasswordValid = await bcrypt.compare(password, DEMO_USER.password);
      
      if (isPasswordValid) {
        // Generate JWT token for demo user
        const token = jwt.sign(
          {
            _id: DEMO_USER._id,
            id: DEMO_USER._id,
            name: DEMO_USER.name,
            email: DEMO_USER.email,
            specialization: DEMO_USER.specialization,
            isAdmin: DEMO_USER.isAdmin
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        // Set cookie
        const cookieStore = cookies();
        cookieStore.set('doctor_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/',
          sameSite: 'strict'
        });
        
        return NextResponse.json({
          status: 'success',
          message: 'Login successful (Demo Mode)',
          doctor: {
            id: DEMO_USER._id,
            name: DEMO_USER.name,
            email: DEMO_USER.email,
            specialization: DEMO_USER.specialization,
            isAdmin: DEMO_USER.isAdmin
          }
        });
      }
    }
    
    // Regular MongoDB login
    try {
      await connectToDatabase();
      
      // Find doctor by email
      const doctor = await Doctor.findOne({ email: email.toLowerCase() });
      
      if (!doctor) {
        return NextResponse.json(
          { 
            status: 'error', 
            message: 'Invalid email or password' 
          }, 
          { status: 401 }
        );
      }
      
      // Verify password
      const isPasswordValid = await doctor.verifyPassword(password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { 
            status: 'error', 
            message: 'Invalid email or password' 
          }, 
          { status: 401 }
        );
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          _id: doctor._id.toString(),
          id: doctor._id.toString(),
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization,
          isAdmin: doctor.isAdmin
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Set cookie
      const cookieStore = cookies();
      cookieStore.set('doctor_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
        sameSite: 'strict'
      });
      
      return NextResponse.json({
        status: 'success',
        message: 'Login successful',
        doctor: {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization,
          isAdmin: doctor.isAdmin
        }
      });
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection error. Try using the demo account (demo@example.com/password123).' 
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'An error occurred during login. Try using the demo account (demo@example.com/password123).' 
      }, 
      { status: 500 }
    );
  }
} 