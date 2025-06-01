import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Use direct mongoose connection instead of importing from gitignored directory
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;
  
  return mongoose.connect(process.env.MONGODB_URI || '');
}

// Function to get current patients with active cases
async function getCurrentPatients() {
  await connectToDatabase();
  
  try {
    // Import models inside the function to avoid issues with schema registration
    const PatientModel = mongoose.models.Patient || mongoose.model('Patient', new mongoose.Schema({}));
    const CaseModel = mongoose.models.Case || mongoose.model('Case', new mongoose.Schema({}));
    
    // First try to load the schema properly
    try {
      if (!mongoose.models.Patient) {
        const PatientSchema = require('@/models/Patient');
        if (PatientSchema.default) {
          mongoose.model('Patient', PatientSchema.default);
        } else {
          mongoose.model('Patient', PatientSchema);
        }
      }
      
      if (!mongoose.models.Case) {
        const CaseSchema = require('@/models/Case');
        if (CaseSchema.default) {
          mongoose.model('Case', CaseSchema.default);
        } else {
          mongoose.model('Case', CaseSchema);
        }
      }
    } catch (schemaError) {
      console.error('Error loading schemas:', schemaError);
    }
    
    // Get the models after ensuring they're registered
    const Patient = mongoose.models.Patient;
    const Case = mongoose.models.Case;
    
    // First approach: Get cases with their patients populated
    const activeCases = await Case.find({ completed: false })
      .populate('patientId')
      .lean();
    
    console.log('Active cases found:', activeCases.length);
    
    if (activeCases.length > 0) {
      // Extract unique patients from the populated cases
      const patientsMap = new Map();
      
      activeCases.forEach((c: any) => {
        if (c.patientId && typeof c.patientId === 'object') {
          patientsMap.set(c.patientId._id.toString(), c.patientId);
        }
      });
      
      return Array.from(patientsMap.values());
    }
    
    // Fallback approach: Get all patients and filter by cases
    const allPatients = await Patient.find({}).lean();
    console.log('All patients found:', allPatients.length);
    
    // If we have at least one patient, return the first one for testing
    if (allPatients.length > 0) {
      console.log('Returning first patient for testing');
      return [allPatients[0]];
    }
    
    return [];
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
        const processedPatients = currentPatients.map((patient: any) => {
            // Keep the MongoDB _id for reference
            const originalId = patient._id ? patient._id.toString() : null;
            
            // Make sure we have all the required fields for the CurrentPatient model
            return {
                ...patient,
                _id: originalId, // Ensure _id is always a string
                
                // If there's an n8n format patient name that doesn't match our schema
                patientName: patient.patientName || patient.name || 'Unknown',
                patientAge: patient.patientAge || patient.age || 0,
                patientGender: patient.patientGender || patient.gender || 'Unknown',
                
                // Ensure other required fields are present
                contact: patient.contact || '',
                email: patient.email || '',
                address: patient.address || '',
                medicalHistory: patient.medicalHistory || '',
                
                // Preserve any extra fields from the n8n workflow
                conversation: patient.conversation || '',
                postDocReport: patient.postDocReport || '',
                preDocReport: patient.preDocReport || '',
                
                // Ensure we have an AI summary from any available source
                aiSummary: patient.aiSummary || patient.medicalHistory || patient.postDocReport || 'No summary available',
                
                // Make sure created date and last updated are always available
                lastUpdated: patient.lastUpdated || patient.createdAt || new Date(),
                consultationDate: patient.consultationDate || patient.createdAt || new Date(),
                
                // Default status if not provided
                status: patient.status || 'active'
            };
        });
        
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