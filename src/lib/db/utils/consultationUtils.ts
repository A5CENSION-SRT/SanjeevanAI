import { Patient, IPatient } from '../models/Patient';
import { CompletedConsultation, ICompletedConsultation } from '../models/CompletedConsultation';
import connectToDatabase from '../mongodb';
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

/**
 * Function for backend to append new WhatsApp chat data to a patient's consultation
 * @param phoneNumber - Patient's phone number
 * @param consultationId - ID of the consultation to update (optional, uses latest if not provided)
 * @param chatData - New chat message data
 * @param imageData - New image data (optional)
 * @returns Updated patient document
 */
export async function appendConsultationData(
    phoneNumber: string,
    chatData?: {
        role: 'user' | 'assistant';
        content: string;
    },
    imageData?: {
        url: string;
        description?: string;
    },
    consultationId?: string
): Promise<IPatient | null> {
    await connectToDatabase();

    try {
        // Find the patient by phone number
        const patient = await Patient.findOne({ phoneNumber });
        if (!patient) {
            console.error(`Patient with phone number ${phoneNumber} not found`);
            return null;
        }

        // Find the consultation to update
        let consultation;
        if (consultationId) {
            consultation = patient.consultations.id(consultationId);
        } else {
            // Get the most recent consultation
            consultation = patient.consultations[patient.consultations.length - 1];
        }

        if (!consultation) {
            console.error('Consultation not found');
            return null;
        }

        // Append chat data if provided
        if (chatData) {
            consultation.aiChat.push({
                role: chatData.role,
                content: chatData.content,
                timestamp: new Date()
            });
        }

        // Append image data if provided
        if (imageData) {
            consultation.images.push({
                url: imageData.url,
                description: imageData.description || '',
                timestamp: new Date()
            });
        }

        // Save the updated patient document
        await patient.save();
        return patient;
    } catch (error) {
        console.error('Error appending consultation data:', error);
        throw error;
    }
}

/**
 * Function for backend to update or create AI-generated prescription
 * @param phoneNumber - Patient's phone number
 * @param consultationId - ID of the consultation to update (optional, uses latest if not provided)
 * @param prescriptionData - Prescription data
 * @returns Updated patient document
 */
export async function updateAIPrescription(
    phoneNumber: string,
    prescriptionData: {
        diagnosis: string;
        medications: Array<{
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
        }>;
        recommendations: string[];
    },
    consultationId?: string
): Promise<IPatient | null> {
    await connectToDatabase();

    try {
        // Find the patient by phone number
        const patient = await Patient.findOne({ phoneNumber });
        if (!patient) {
            console.error(`Patient with phone number ${phoneNumber} not found`);
            return null;
        }

        // Find the consultation to update
        let consultation;
        if (consultationId) {
            consultation = patient.consultations.id(consultationId);
        } else {
            // Get the most recent consultation
            consultation = patient.consultations[patient.consultations.length - 1];
        }

        if (!consultation) {
            console.error('Consultation not found');
            return null;
        }

        // Update the prescription
        consultation.finalPrescription = {
            ...consultation.finalPrescription,
            ...prescriptionData,
            generatedAt: new Date()
        };

        // Ensure status is pending_review
        consultation.status = 'pending_review';

        // Save the updated patient document
        await patient.save();
        return patient;
    } catch (error) {
        console.error('Error updating AI prescription:', error);
        throw error;
    }
}

/**
 * Function to create a new consultation for an existing patient
 * @param phoneNumber - Patient's phone number
 * @param initialMessage - Initial message from the patient
 * @returns Updated patient document
 */
export async function createNewConsultation(
    phoneNumber: string,
    initialMessage: string
): Promise<IPatient | null> {
    await connectToDatabase();

    try {
        // Find the patient by phone number
        const patient = await Patient.findOne({ phoneNumber });
        if (!patient) {
            console.error(`Patient with phone number ${phoneNumber} not found`);
            return null;
        }

        // Create a new consultation
        const newConsultation = {
            date: new Date(),
            aiChat: [{
                role: 'user',
                content: initialMessage,
                timestamp: new Date()
            }],
            images: [],
            finalPrescription: {
                diagnosis: '',
                medications: [],
                recommendations: [],
                generatedAt: new Date()
            },
            status: 'pending_review'
        };

        // Add the new consultation to the patient
        patient.consultations.push(newConsultation);

        // Save the updated patient document
        await patient.save();
        return patient;
    } catch (error) {
        console.error('Error creating new consultation:', error);
        throw error;
    }
}

/**
 * Function to move a completed consultation to the CompletedConsultation collection
 * @param patientId - Patient's MongoDB ID
 * @param consultationId - Consultation ID
 * @param doctorId - Doctor's MongoDB ID
 * @param doctorName - Doctor's name
 * @param comments - Doctor's comments
 * @returns The created CompletedConsultation document
 */
export async function moveToCompletedConsultations(
    patientId: string,
    consultationId: string,
    doctorId: string,
    doctorName: string,
    comments?: string
): Promise<ICompletedConsultation | null> {
    await connectToDatabase();

    try {
        // Find the patient
        const patient = await Patient.findById(patientId);
        if (!patient) {
            console.error(`Patient with ID ${patientId} not found`);
            return null;
        }

        // Find the consultation
        const consultation = patient.consultations.id(consultationId);
        if (!consultation) {
            console.error(`Consultation with ID ${consultationId} not found`);
            return null;
        }

        // Create a new completed consultation
        const completedConsultation = new CompletedConsultation({
            patientId: patient._id,
            patientName: patient.name,
            patientAge: patient.age,
            patientGender: patient.gender,
            patientPhone: patient.phoneNumber,
            consultationDate: consultation.date,
            completedDate: new Date(),
            diagnosis: consultation.finalPrescription.diagnosis,
            medications: consultation.finalPrescription.medications,
            recommendations: consultation.finalPrescription.recommendations,
            doctorId: new mongoose.Types.ObjectId(doctorId),
            doctorName,
            doctorComments: comments || '',
            aiChat: consultation.aiChat,
            images: consultation.images
        });

        // Save the completed consultation
        await completedConsultation.save();

        // Update the consultation status in the patient document
        consultation.status = 'completed';
        consultation.finalPrescription.reviewedBy = {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            reviewedAt: new Date(),
            comments: comments || ''
        };
        await patient.save();

        return completedConsultation;
    } catch (error) {
        console.error('Error moving to completed consultations:', error);
        throw error;
    }
}

/**
 * Function to get all completed consultations
 * @returns Array of completed consultations
 */
export async function getCompletedConsultations(): Promise<ICompletedConsultation[]> {
    await connectToDatabase();
    return CompletedConsultation.find().sort({ completedDate: -1 });
}

/**
 * Function to get completed consultations for a specific patient
 * @param phoneNumber - Patient's phone number
 * @returns Array of completed consultations
 */
export async function getPatientCompletedConsultations(phoneNumber: string): Promise<ICompletedConsultation[]> {
    await connectToDatabase();
    return CompletedConsultation.find({ patientPhone: phoneNumber }).sort({ completedDate: -1 });
}

// Get all completed consultations
export async function getCompletedConsultationsFromDatabase() {
    try {
        console.log("Getting completed consultations from database...");
        
        // Use the direct MongoDB connection that we know works
        const username = "sanjiviniapp";
        const password = "Raghottam";
        const clusterUrl = "sanjeeviniai.eq040vd.mongodb.net";
        const connectionString = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=SanjeeviniAI`;
        
        const client = new MongoClient(connectionString);
        await client.connect();
        
        const db = client.db("doctor_portal");
        const completedConsultations = await db.collection("completedconsultations").find({}).sort({ completedDate: -1 }).toArray();
        
        console.log(`Found ${completedConsultations.length} completed consultations`);
        
        await client.close();
        
        return completedConsultations;
    } catch (error) {
        console.error('Error in getCompletedConsultations:', error);
        throw error;
    }
}

// Get completed consultations for a specific doctor
export async function getDoctorCompletedConsultations(doctorId: string) {
    try {
        await connectToDatabase();
        
        const completedConsultations = await CompletedConsultation.find({ 
            doctorId: new mongoose.Types.ObjectId(doctorId) 
        }).sort({ completedDate: -1 });
        
        return completedConsultations;
    } catch (error) {
        console.error('Error in getDoctorCompletedConsultations:', error);
        throw error;
    }
}

// Get a specific completed consultation by ID
export async function getCompletedConsultationById(consultationId: string) {
    try {
        await connectToDatabase();
        
        const completedConsultation = await CompletedConsultation.findById(consultationId);
        
        return completedConsultation;
    } catch (error) {
        console.error('Error in getCompletedConsultationById:', error);
        throw error;
    }
} 