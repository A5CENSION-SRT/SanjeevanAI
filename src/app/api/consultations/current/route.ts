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

// Function to get current patients with active cases
async function getCurrentPatients() {
  await connectToDatabase();
  
  try {
    // Import models directly using the correct path
    const PatientModel = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient').schema);
    const CaseModel = mongoose.models.Case || mongoose.model('Case', require('@/models/Case').schema);
    
    console.log('Models loaded successfully');
    console.log('Database connection:', mongoose.connection.name);
    
    // Check if db is available before trying to list collections
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
    } else {
      console.log('Database connection not fully established yet');
    }
    
    // Get all patients first
    const allPatients = await PatientModel.find({}).lean();
    console.log('All patients found:', allPatients.length);
    if (allPatients.length > 0) {
      console.log('Sample patient:', JSON.stringify(allPatients[0], null, 2));
    }
    
    // Get all cases regardless of doctor approval status
    // Only filter by completed status to show active cases
    const activeCases = await CaseModel.find({ completed: false })
      .populate('patientId')
      .lean();
    
    console.log('Active cases found:', activeCases.length);
    if (activeCases.length > 0) {
      console.log('Sample case:', JSON.stringify(activeCases[0], null, 2));
    }
    
    // Create a map to track which patients already have cases
    const patientIdsToCases = new Map();
    
    // Process all active cases
    activeCases.forEach(c => {
      if (c.patientId && typeof c.patientId === 'object') {
        const patientId = c.patientId._id.toString();
        patientIdsToCases.set(patientId, c._id);
      }
    });
    
    // Create a combined list of all patients with case information
    const patientsWithCaseInfo: any[] = [];
    
    // First add patients that have active cases
    for (const c of activeCases) {
      if (c.patientId && typeof c.patientId === 'object') {
        const patientId = c.patientId._id.toString();
        
        // Only add each patient once
        if (!patientsWithCaseInfo.some(p => p._id.toString() === patientId)) {
          // Keep nested objects intact
          let aiSummary = c.aiAnalysis || c.patientHistory || 'No summary available';
          
          // Process research field if it exists
          let research = c.research || null;
          if (research && typeof research === 'object') {
            research = 'Research data available';
          }
          
          // Process FAQ field if it exists
          let faq = c.faq || null;
          if (faq && typeof faq === 'object') {
            faq = 'FAQ data available';
          }
          
          // Process prescription if it exists
          let prescription = '';
          if (c.prescription) {
            if (typeof c.prescription === 'string') {
              prescription = c.prescription;
            } else if (typeof c.prescription === 'object' && c.prescription.content) {
              prescription = c.prescription.content;
            } else {
              prescription = 'Prescription available';
            }
          }
          
          patientsWithCaseInfo.push({
            ...c.patientId,
            caseId: c._id,
            aiSummary: aiSummary,
            research: research,
            faq: faq,
            prescription: prescription,
            transcript: c.transcript || '',
            summary: c.patientHistory || '',
            completed: c.completed || false,
            approved: c.approved || false,
            lastUpdated: c.updatedAt || c.createdAt
          });
        }
      }
    }
    
    console.log('Patients with active cases:', patientsWithCaseInfo.length);
    
    // If there are patients but no active cases, return all patients
    if (patientsWithCaseInfo.length === 0 && allPatients.length > 0) {
      return allPatients.map(patient => {
        // Keep medicalHistory in its original format
        const medicalHistory = patient.medicalHistory || 'Patient requires consultation';
        
        return {
          ...patient,
          aiSummary: medicalHistory, // Keep original format
          lastUpdated: patient.createdAt || new Date()
        };
      });
    }
    
    return patientsWithCaseInfo;
  } catch (error) {
    console.error('Error in getCurrentPatients:', error);
    return [];
  }
}

export async function GET() {
    try {
        console.log('Fetching current patients...');
        const currentPatients = await getCurrentPatients();
        console.log(`Found ${currentPatients.length} current patients`);
        
        // Process the current patients data to ensure compatibility with UI components
        const processedPatients = currentPatients.map((patient) => {
            // Keep the MongoDB _id for reference
            const originalId = patient._id ? patient._id.toString() : null;
            
            // Ensure caseId is a string if it exists
            const caseId = patient.caseId ? 
                (typeof patient.caseId === 'object' && patient.caseId._id ? 
                    patient.caseId._id.toString() : 
                    patient.caseId.toString()) : 
                null;
            
            // Ensure aiSummary is always a string
            let aiSummary = patient.aiSummary || patient.medicalHistory || 'No summary available';
            if (typeof aiSummary !== 'string') {
                aiSummary = JSON.stringify(aiSummary);
            }
            
            // Ensure medicalHistory is always a string
            let medicalHistory = patient.medicalHistory || '';
            if (typeof medicalHistory !== 'string') {
                medicalHistory = JSON.stringify(medicalHistory);
            }
            
            // Map the database schema fields to the UI expected fields
            return {
                _id: originalId, // Ensure _id is always a string
                
                // Map patient fields from the database schema to UI expected fields
                patientName: patient.name || 'Unknown',
                patientAge: typeof patient.age === 'number' ? patient.age : 0,
                patientGender: patient.gender || 'Unknown',
                
                // Include case information if available
                caseId: caseId,
                
                // Ensure other required fields are present
                contact: patient.contact || '',
                email: patient.email || '',
                address: patient.address || '',
                
                // AI analysis and medical history
                aiSummary: aiSummary,
                medicalHistory: medicalHistory,
                
                // Make sure created date and last updated are always available
                lastUpdated: patient.updatedAt || patient.createdAt || new Date(),
                consultationDate: patient.createdAt || new Date(),
                
                // Default status if not provided
                status: 'active'
            };
        });
        
        console.log('Processed patients:', processedPatients.length);
        if (processedPatients.length > 0) {
            console.log('Sample processed patient:', JSON.stringify(processedPatients[0], null, 2));
        }
        
        return NextResponse.json({
            status: 'success',
            data: processedPatients,
            count: processedPatients.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching current patients:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to fetch current patients',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 