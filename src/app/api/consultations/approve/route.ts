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
      connectionUri = `${uri}/doctor_portal`;
    }
  }
  
  return mongoose.connect(connectionUri);
}

// Import models using the pattern from memory
const CaseModel = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));

export async function POST(request: NextRequest) {
  try {
    console.log('Approval API called');
    await connectToDatabase();
    
    const body = await request.json();
    console.log('Request body:', body);
    const { caseId, approved, doctorId, doctorName, doctorNotes, prescription } = body;
    
    if (!caseId) {
      console.log('Error: Case ID is required');
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }
    
    // Find the case
    console.log('Finding case with ID:', caseId);
    const caseData = await CaseModel.findById(caseId);
    
    if (!caseData) {
      console.log('Error: Case not found with ID:', caseId);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }
    
    console.log('Case found:', caseData._id);
    
    // Update the fields that exist in the Case schema based on your model definition
    const timestamp = new Date();
    
    // Set the main approved field
    console.log(`Setting approval status to: ${approved}`);
    caseData.approved = approved;
    
    // Update doctor information
    if (doctorId) {
      console.log(`Updating doctorId to: ${doctorId}`);
      caseData.doctorId = doctorId;
    }
    
    if (doctorName) {
      console.log(`Updating doctorName to: ${doctorName}`);
      caseData.doctorName = doctorName;
    }
    
    // Add doctor notes
    if (doctorNotes) {
      console.log(`Adding doctor comments: ${doctorNotes}`);
      caseData.doctorComments = doctorNotes;
    }
    
    // Update timestamp
    caseData.updatedAt = timestamp;
    
    // Log the case data before saving
    console.log('Case data to be saved:', {
      id: caseData._id,
      approved: caseData.approved,
      doctorId: caseData.doctorId,
      doctorName: caseData.doctorName,
      doctorComments: caseData.doctorComments,
      updatedAt: caseData.updatedAt
    });
    
    try {
      // Create base update object
      let updateQuery: any = {
        $set: {
          approved: approved,
          doctorId: doctorId || caseData.doctorId,
          doctorName: doctorName || caseData.doctorName,
          doctorComments: doctorNotes || caseData.doctorComments,
          updatedAt: timestamp
        }
      };
      
      // Handle prescription data if provided - use proper MongoDB dot notation
      if (prescription) {
        console.log('Adding prescription data:', prescription);
        
        // Add prescription data to the $set operator
        updateQuery.$set["prescription.content"] = prescription;
        updateQuery.$set["prescription.doctorId"] = doctorId || caseData.doctorId;
        updateQuery.$set["prescription.createdAt"] = timestamp;
      }
      
      console.log('Update query:', JSON.stringify(updateQuery));
      
      // Use findByIdAndUpdate to avoid validation issues with required fields like patientId
      const updatedCase = await CaseModel.findByIdAndUpdate(
        caseId,
        updateQuery,
        { new: true, runValidators: false }
      );
      
      console.log('Case updated successfully:', updatedCase?._id);
      
      if (!updatedCase) {
        throw new Error('Failed to update case');
      }
    } catch (updateError) {
      console.error('Error during findByIdAndUpdate:', updateError);
      throw updateError;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Case ${approved ? 'approved' : 'rejected'} successfully`,
      case: caseData
    });
  } catch (error) {
    console.error('Error updating approval status:', error);
    return NextResponse.json({ 
      error: 'Failed to update approval status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
