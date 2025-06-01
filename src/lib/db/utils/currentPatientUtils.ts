import { Patient } from '../models/Patient';
import { CurrentPatient } from '../models/CurrentPatient';
import { CompletedConsultation } from '../models/CompletedConsultation';
import { Doctor } from '../models/Doctor';
import mongoose from 'mongoose';
import connectToDatabase from '../mongodb';
import { MongoClient } from 'mongodb';

// Add a patient to current patients when a new consultation is created
export async function addToCurrentPatients(patientId: string, consultationId: string) {
  await connectToDatabase();
  
  try {
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }
    
    // Check if this patient is already in current patients
    const existingCurrentPatient = await CurrentPatient.findOne({ 
      patientId: new mongoose.Types.ObjectId(patientId),
      status: 'active'
    });
    
    if (existingCurrentPatient) {
      // Update the existing record
      existingCurrentPatient.consultationId = new mongoose.Types.ObjectId(consultationId);
      existingCurrentPatient.lastUpdated = new Date();
      await existingCurrentPatient.save();
      return existingCurrentPatient;
    }
    
    // Create a new current patient record
    const currentPatient = new CurrentPatient({
      patientId: new mongoose.Types.ObjectId(patientId),
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientPhone: patient.phoneNumber,
      consultationId: new mongoose.Types.ObjectId(consultationId),
      aiSummary: 'New consultation initiated'
    });
    
    await currentPatient.save();
    return currentPatient;
    
  } catch (error) {
    console.error('Error in addToCurrentPatients:', error);
    throw error;
  }
}

// Get all current patients for doctor dashboard
export async function getCurrentPatients() {
  try {
    console.log("Getting current patients from database...");
    
    await connectToDatabase();
    const currentPatients = await CurrentPatient.find({}).sort({ lastUpdated: -1 });
    
    console.log(`Found ${currentPatients.length} current patients from Mongoose connection`);
    
    // If no patients found or error with Mongoose, try direct MongoDB connection
    if (!currentPatients || currentPatients.length === 0) {
      console.log("No patients found with Mongoose. Trying direct MongoDB connection...");
      
      // Use the direct MongoDB connection that we know works
      const username = "sanjiviniapp";
      const password = "Raghottam";
      const clusterUrl = "sanjeeviniai.eq040vd.mongodb.net";
      const connectionString = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=SanjeeviniAI`;
      
      const client = new MongoClient(connectionString);
      await client.connect();
      
      const db = client.db("doctor_portal");
      const directPatients = await db.collection("currentpatients").find({}).sort({ lastUpdated: -1 }).toArray();
      
      console.log(`Found ${directPatients.length} current patients with direct MongoDB connection`);
      
      await client.close();
      
      return directPatients;
    }
    
    return currentPatients;
  } catch (error) {
    console.error('Error in getCurrentPatients:', error);
    throw error;
  }
}

// Update the AI summary for a current patient
export async function updateAISummary(patientId: string, aiSummary: string) {
  await connectToDatabase();
  
  try {
    const currentPatient = await CurrentPatient.findOne({ 
      patientId: new mongoose.Types.ObjectId(patientId),
      status: 'active'
    });
    
    if (!currentPatient) {
      throw new Error(`No active consultation found for patient ${patientId}`);
    }
    
    currentPatient.aiSummary = aiSummary;
    currentPatient.lastUpdated = new Date();
    await currentPatient.save();
    
    return currentPatient;
  } catch (error) {
    console.error('Error in updateAISummary:', error);
    throw error;
  }
}

// Move a patient from current to completed consultations
export async function completeConsultation(
  currentPatientId: string, 
  doctorId: string,
  doctorName: string,
  doctorComments: string,
  prescriptionData: any = null
) {
  await connectToDatabase();
  
  try {
    console.log(`Starting completeConsultation for patient ${currentPatientId}`);
    
    // Validate doctor ID format - must be a valid ObjectId
    let doctorObjectId: mongoose.Types.ObjectId;
    try {
      // Check if doctorId is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(doctorId)) {
        doctorObjectId = new mongoose.Types.ObjectId(doctorId);
      } else {
        // If not valid, create a new ObjectId to use instead
        console.log(`Doctor ID ${doctorId} is not a valid ObjectId, generating a new one`);
        doctorObjectId = new mongoose.Types.ObjectId();
      }
    } catch (error) {
      console.log(`Error converting doctor ID: ${error}`);
      doctorObjectId = new mongoose.Types.ObjectId(); // Fallback to new ObjectId
    }
    
    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find the current patient
      const currentPatient = await CurrentPatient.findById(currentPatientId).session(session);
      
      if (!currentPatient) {
        throw new Error(`Current patient with ID ${currentPatientId} not found`);
      }

      console.log(`Found current patient: ${currentPatient.patientName}`);

      // Handle cases where patientId is null by using only the current patient data
      let patient = null;
      let consultation = null;

      if (currentPatient.patientId) {
        // Try to find the patient and their consultation
        patient = await Patient.findById(currentPatient.patientId).session(session);
        
        if (patient) {
          console.log(`Found patient record: ${patient.name}`);
          if (currentPatient.consultationId) {
            consultation = patient.consultations.id(currentPatient.consultationId);
            if (consultation) {
              console.log(`Found consultation record in patient document`);
            } else {
              console.log(`Consultation with ID ${currentPatient.consultationId} not found in patient document`);
            }
          } else {
            console.log(`Current patient has no linked consultationId`);
          }
        } else {
          console.log(`Patient with ID ${currentPatient.patientId} not found`);
        }
      } else {
        console.log(`Current patient has no linked patientId`);
      }
      
      // If we couldn't find the patient or consultation, create a completed consultation from current patient data
      if (!patient || !consultation) {
        console.log(`Creating completed consultation directly from current patient data for ${currentPatient.patientName}`);
        
        // Create a completed consultation record from available data
        const completedConsultation = new CompletedConsultation({
          patientId: currentPatient.patientId || new mongoose.Types.ObjectId(), // Use current ID or generate new one
          patientName: currentPatient.patientName,
          patientAge: currentPatient.patientAge,
          patientGender: currentPatient.patientGender,
          patientPhone: currentPatient.patientPhone,
          consultationDate: currentPatient.consultationDate || new Date(),
          completedDate: new Date(),
          diagnosis: prescriptionData?.diagnosis || 'Not specified',
          medications: prescriptionData?.medications || [],
          recommendations: prescriptionData?.recommendations || [],
          doctorId: doctorObjectId, // Use the validated/fixed doctor ID
          doctorName: doctorName,
          doctorComments: doctorComments,
          aiChat: [
            {
              role: 'assistant',
              content: currentPatient.aiSummary || 'No AI summary available',
              timestamp: new Date()
            }
          ],
          images: []
        });
        
        await completedConsultation.save({ session });
        console.log(`Saved completed consultation for ${currentPatient.patientName}`);
        
        // Remove from current patients
        await CurrentPatient.findByIdAndDelete(currentPatientId, { session });
        console.log(`Removed patient from current patients`);
        
        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        
        return completedConsultation;
      }
      
      // Standard flow when patient and consultation exist
      // Update the prescription with doctor's data if provided
      if (prescriptionData) {
        if (!consultation.finalPrescription) {
          consultation.finalPrescription = {
            diagnosis: prescriptionData.diagnosis || 'Not specified',
            medications: prescriptionData.medications || [],
            recommendations: prescriptionData.recommendations || [],
            generatedAt: new Date(),
            reviewedBy: {
              doctorId: doctorObjectId, // Use the validated/fixed doctor ID
              reviewedAt: new Date(),
              comments: doctorComments || ''
            }
          };
        } else {
          consultation.finalPrescription.diagnosis = prescriptionData.diagnosis || consultation.finalPrescription.diagnosis;
          consultation.finalPrescription.medications = prescriptionData.medications || consultation.finalPrescription.medications;
          consultation.finalPrescription.recommendations = prescriptionData.recommendations || consultation.finalPrescription.recommendations;
          
          if (!consultation.finalPrescription.reviewedBy) {
            consultation.finalPrescription.reviewedBy = {
              doctorId: doctorObjectId, // Use the validated/fixed doctor ID
              reviewedAt: new Date(),
              comments: doctorComments || ''
            };
          }
        }
        
        // Add any new images to the consultation
        if (prescriptionData.imageUrls && prescriptionData.imageUrls.length > 0) {
          if (!consultation.images) {
            consultation.images = [];
          }
          
          for (const imageUrl of prescriptionData.imageUrls) {
            consultation.images.push({
              url: imageUrl,
              description: 'Prescription image',
              timestamp: new Date()
            });
          }
        }
      }
      
      // Create a completed consultation record
      const completedConsultation = new CompletedConsultation({
        patientId: patient._id,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        patientPhone: patient.phoneNumber,
        consultationDate: consultation.date,
        completedDate: new Date(),
        diagnosis: consultation.finalPrescription?.diagnosis || 'Not specified',
        medications: consultation.finalPrescription?.medications || [],
        recommendations: consultation.finalPrescription?.recommendations || [],
        doctorId: doctorObjectId, // Use the validated/fixed doctor ID
        doctorName: doctorName,
        doctorComments: doctorComments,
        aiChat: consultation.aiChat || [],
        images: consultation.images || []
      });
      
      await completedConsultation.save({ session });
      console.log(`Saved completed consultation record for ${patient.name}`);
      
      // Update the consultation status in the patient record
      consultation.status = 'completed';
      if (!consultation.finalPrescription.reviewedBy) {
        consultation.finalPrescription.reviewedBy = {
          doctorId: doctorObjectId, // Use the validated/fixed doctor ID
          reviewedAt: new Date(),
          comments: doctorComments
        };
      }
      
      await patient.save({ session });
      console.log(`Updated patient record with completed consultation`);
      
      // Remove from current patients
      await CurrentPatient.findByIdAndDelete(currentPatientId, { session });
      console.log(`Removed patient from current patients`);
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      return completedConsultation;
      
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
    
  } catch (error) {
    console.error('Error in completeConsultation:', error);
    throw error;
  }
}