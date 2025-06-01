import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'sanjeevini-doctor-portal-secret';

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('doctor_token')?.value;
    
    if (!token) {
      console.log('Auth check: No token found');
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Not authenticated' 
        }, 
        { status: 401 }
      );
    }
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('Auth check: Token verified successfully');
      
      // Return user info with formatted doctor object
      return NextResponse.json({
        status: 'success',
        message: 'Authenticated',
        doctor: {
          id: decoded._id || decoded.id,
          name: decoded.name,
          email: decoded.email,
          specialization: decoded.specialization
        }
      });
    } catch (verifyError) {
      console.error('Auth check: JWT verification failed:', verifyError);
      
      // Clear the invalid token
      cookieStore.delete('doctor_token');
      
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Invalid token' 
        }, 
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Authentication check failed' 
      }, 
      { status: 500 }
    );
  }
} 