import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Use direct mongoose connection instead of importing from gitignored directory
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    console.log('Already connected to MongoDB');
    return;
  }
  
  // Connect to the specific database
  console.log('Connecting to MongoDB with URI from env variables...');
  const uri = process.env.MONGODB_URI || '';
  
  // Ensure we're connecting to the doctor_portal database
  // If the URI doesn't specify a database, append it
  let connectionUri = uri;
  if (!uri.includes('doctor_portal')) {
    // If URI ends with '/', just append the database name
    if (uri.endsWith('/')) {
      connectionUri = `${uri}doctor_portal`;
    } else {
      // Otherwise append /doctor_portal
      connectionUri = `${uri}/doctor_portal`;
    }
  }
  
  console.log('Using database: doctor_portal');
  return mongoose.connect(connectionUri);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting consultation completion process...');
    
    // Connect to the database
    await connectToDatabase();
    
    const data = await request.json();
    const { 
      currentPatientId, // This is actually the case ID
      doctorId, 
      doctorName,
      doctorComments,
      prescription
    } = data;
    
    console.log(`Completing consultation for case ID: ${currentPatientId}`);
    
    if (!currentPatientId || !doctorId || !doctorName) {
      console.error('Missing required fields');
      return NextResponse.json({
        status: 'error',
        message: 'Missing required fields: currentPatientId, doctorId, doctorName'
      }, { status: 400 });
    }
    
    // Load models
    const CaseModel = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));
    console.log('Case model loaded successfully');
    
    // Find the case by ID
    const caseData = await CaseModel.findById(currentPatientId);
    
    if (!caseData) {
      console.error(`Case not found with ID: ${currentPatientId}`);
      return NextResponse.json({ 
        status: 'error',
        message: 'Case not found' 
      }, { status: 404 });
    }
    
    // Update the case with doctor information and set it as completed and approved
    caseData.completed = true;
    caseData.approved = true; // Set the approved flag to true
    
    // Add prescription if provided
    if (prescription) {
      caseData.prescription = {
        content: prescription,
        doctorId: doctorId,
        createdAt: new Date()
      };
    }
    
    // Add doctor comments and update timestamp
    caseData.doctorComments = doctorComments;
    caseData.doctorId = doctorId;
    caseData.doctorName = doctorName;
    caseData.updatedAt = new Date();
    caseData.completedAt = new Date();
    
    // Save the updated case
    const updatedCase = await caseData.save();
    
    console.log(`Case updated successfully: ${updatedCase._id}`);
    console.log(`Completed: ${updatedCase.completed}, Approved: ${updatedCase.approved}`);
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Consultation completed successfully', 
      case: {
        _id: updatedCase._id,
        patientId: updatedCase.patientId,
        completed: updatedCase.completed,
        approved: updatedCase.approved,
        completedAt: updatedCase.completedAt,
        doctorName: updatedCase.doctorName,
        doctorComments: updatedCase.doctorComments
      }
    });
    
  } catch (error) {
    console.error('Error completing consultation:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error completing consultation', 
      error: (error as Error).message 
    }, { status: 500 });
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}
