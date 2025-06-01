import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the authentication cookie
  const cookieStore = cookies();
  cookieStore.delete('doctor_token');
  
  return NextResponse.json({
    status: 'success',
    message: 'Logged out successfully'
  });
} 