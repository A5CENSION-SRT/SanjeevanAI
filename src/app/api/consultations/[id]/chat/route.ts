import { NextResponse } from 'next/server';
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Fetching chat data for ID: ${params.id}`);
    await connectToDatabase();
    
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Define models directly using mongoose
    const PatientModel = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient'));
    const CaseModel = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));
    
    console.log('Models loaded successfully');
    
    // First try to find a case with this ID
    let caseData: any = await CaseModel.findById(id).populate('patientId').lean();
    
    // If no case found, try to find a case for this patient ID
    if (!caseData) {
      console.log(`No case found with ID ${id}, trying to find case for patient ID`);
      
      // Check if this is a patient ID and find their active case
      const patient = await PatientModel.findById(id).lean();
      
      if (patient) {
        console.log(`Found patient with ID ${id}, looking for their active cases`);
        // Find active cases for this patient
        caseData = await CaseModel.findOne({ 
          patientId: id,
          completed: false 
        }).lean();
      }
      
      if (!caseData) {
        console.log(`No case found for ID ${id}`);
        return NextResponse.json(
          { error: 'No active case found for this ID' },
          { status: 404 }
        );
      }
    }
    
    // Extract patient data - handle both populated and non-populated cases
    let patient: any;
    if (caseData.patientId) {
      if (typeof caseData.patientId === 'object') {
        patient = caseData.patientId;
      } else {
        // If patientId is just an ID, fetch the patient
        patient = await PatientModel.findById(caseData.patientId).lean();
      }
    }
    
    if (!patient) {
      console.log('Patient not found for case:', caseData._id);
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    console.log(`Found patient: ${patient.name} for case: ${caseData._id}`);
    
    // Process nested fields to ensure they're strings
    let transcript = caseData.transcript || '';
    if (typeof transcript !== 'string') {
      transcript = JSON.stringify(transcript);
    }
    
    let patientHistory = caseData.patientHistory || '';
    if (typeof patientHistory !== 'string') {
      patientHistory = JSON.stringify(patientHistory);
    }
    
    let aiAnalysis = caseData.aiAnalysis || '';
    if (typeof aiAnalysis !== 'string') {
      aiAnalysis = JSON.stringify(aiAnalysis);
    }
    
    // Ensure we have valid IDs as strings
    const caseId = caseData._id ? caseData._id.toString() : id;
    const patientId = patient._id ? patient._id.toString() : '';
    
    // Return the chat/transcript data
    return NextResponse.json({
      status: 'success',
      data: {
        caseId: caseId,
        patientId: patientId,
        transcript: transcript,
        patientHistory: patientHistory,
        aiAnalysis: aiAnalysis,
        patientInfo: caseData.patientInfo || {},
        patientName: patient.name || 'Unknown',
        patientAge: patient.age || 0,
        patientGender: patient.gender || 'Unknown',
        lastUpdated: caseData.updatedAt || caseData.createdAt || new Date()
      }
    });
    
  } catch (error) {
    console.error('Error fetching consultation chat:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to fetch chat history',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // No need to close the connection for API routes that are frequently accessed
    // This prevents connection churn
  }
} 