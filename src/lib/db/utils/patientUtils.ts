import { Patient, IPatient } from '../models/Patient';
import connectToDatabase from '../mongodb';
import mongoose from 'mongoose';
import { addToCurrentPatients } from './currentPatientUtils';

export async function getPatientByPhone(phoneNumber: string): Promise<IPatient | null> {
    await connectToDatabase();
    return Patient.findOne({ phoneNumber });
}

export async function getPendingConsultations(): Promise<IPatient[]> {
    await connectToDatabase();
    return Patient.find({
        'consultations.status': 'pending_review'
    }).sort({ 'consultations.date': -1 });
}

export async function updateConsultationStatus(
    patientId: string,
    consultationId: string,
    doctorId: string,
    status: 'reviewed' | 'completed',
    comments?: string
) {
    await connectToDatabase();

    return Patient.findOneAndUpdate(
        {
            _id: patientId,
            'consultations._id': consultationId
        },
        {
            $set: {
                'consultations.$.status': status,
                'consultations.$.finalPrescription.reviewedBy': {
                    doctorId,
                    reviewedAt: new Date(),
                    comments: comments || ''
                }
            }
        },
        { new: true }
    );
}

// Function to create test data
export async function createTestPatient() {
    await connectToDatabase();

    const testPatient = {
        name: "John Smith",
        age: 45,
        gender: "male",
        phoneNumber: "+1234567890",
        consultations: [{
            date: new Date(),
            aiChat: [
                {
                    role: "user",
                    content: "I've been having severe headaches and dizziness for the past week",
                    timestamp: new Date()
                },
                {
                    role: "assistant",
                    content: "I understand you're experiencing headaches and dizziness. How long do these episodes typically last? Have you noticed any specific triggers?",
                    timestamp: new Date()
                },
                {
                    role: "user",
                    content: "The headaches last for several hours, usually worse in the morning. I've also been working long hours at my computer.",
                    timestamp: new Date()
                }
            ],
            images: [
                {
                    url: "https://example.com/medical-report.jpg",
                    description: "Previous medical report showing normal blood pressure readings",
                    timestamp: new Date()
                }
            ],
            finalPrescription: {
                diagnosis: "Tension Headache with possible Computer Vision Syndrome",
                medications: [
                    {
                        name: "Ibuprofen",
                        dosage: "400mg",
                        frequency: "Twice daily",
                        duration: "5 days"
                    },
                    {
                        name: "Cyclobenzaprine",
                        dosage: "5mg",
                        frequency: "Once daily before bed",
                        duration: "5 days"
                    }
                ],
                recommendations: [
                    "Take regular breaks from computer work (20-20-20 rule)",
                    "Ensure proper posture while working",
                    "Consider computer glasses with anti-glare coating",
                    "Stay hydrated and maintain regular sleep schedule"
                ],
                generatedAt: new Date()
            },
            status: "pending_review"
        }]
    };

    try {
        const existingPatient = await Patient.findOne({ phoneNumber: testPatient.phoneNumber });
        if (existingPatient) {
            console.log('Test patient already exists');
            return existingPatient;
        }

        const newPatient = new Patient(testPatient);
        await newPatient.save();
        console.log('Test patient created successfully');
        return newPatient;
    } catch (error) {
        console.error('Error creating test patient:', error);
        throw error;
    }
}

export async function createAnayaPatient() {
    await connectToDatabase();

    const anayaPatient = {
        name: "Anaya Iyer",
        age: 25, // Adding a default age since it wasn't provided
        gender: "female",
        phoneNumber: "+919876543210", // Adding a default phone number
        consultations: [{
            date: new Date(),
            aiChat: [
                {
                    role: "user",
                    content: "My head hurts",
                    timestamp: new Date()
                },
                {
                    role: "assistant",
                    content: "How long has it been hurting?",
                    timestamp: new Date()
                }
            ],
            images: [], // No images provided in the initial data
            finalPrescription: {
                diagnosis: "Tension Headache",
                medications: [
                    {
                        name: "Paracetamol",
                        dosage: "500mg",
                        frequency: "As needed",
                        duration: "3 days"
                    },
                    {
                        name: "Ibuprofen",
                        dosage: "400mg",
                        frequency: "As needed",
                        duration: "3 days"
                    }
                ],
                recommendations: [
                    "Hydration",
                    "Rest",
                    "Avoid screen time"
                ],
                generatedAt: new Date()
            },
            status: "pending_review" // Corrected from "pending-review" to match enum
        }]
    };

    try {
        const existingPatient = await Patient.findOne({ name: anayaPatient.name });
        if (existingPatient) {
            console.log('Anaya patient already exists');
            return existingPatient;
        }

        const newPatient = new Patient(anayaPatient);
        await newPatient.save();
        console.log('Anaya patient created successfully');
        return newPatient;
    } catch (error) {
        console.error('Error creating Anaya patient:', error);
        throw error;
    }
}

export async function getAllPatients(): Promise<IPatient[]> {
    await connectToDatabase();
    return Patient.find({});
}

// Create a new patient with initial consultation
export async function createPatient(
  name: string,
  age: number,
  gender: string,
  phoneNumber: string,
  initialMessage: string
) {
  await connectToDatabase();
  
  try {
    // Check if patient with this phone number already exists
    const existingPatient = await Patient.findOne({ phoneNumber });
    
    if (existingPatient) {
      // Add a new consultation to existing patient
      const consultation = {
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
      
      existingPatient.consultations.push(consultation);
      await existingPatient.save();
      
      // Add to current patients
      const consultationId = existingPatient.consultations[existingPatient.consultations.length - 1]._id;
      await addToCurrentPatients(existingPatient._id.toString(), consultationId.toString());
      
      return {
        patient: existingPatient,
        consultationId,
        isNew: false
      };
    }
    
    // Create a new patient
    const newPatient = new Patient({
      name,
      age,
      gender,
      phoneNumber,
      consultations: [{
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
      }]
    });
    
    await newPatient.save();
    
    // Add to current patients
    const consultationId = newPatient.consultations[0]._id;
    await addToCurrentPatients(newPatient._id.toString(), consultationId.toString());
    
    return {
      patient: newPatient,
      consultationId,
      isNew: true
    };
    
  } catch (error) {
    console.error('Error in createPatient:', error);
    throw error;
  }
}

// Append chat message to a patient's consultation
export async function appendChatMessage(
  phoneNumber: string,
  message: { role: 'user' | 'assistant', content: string },
  consultationId?: string
) {
  await connectToDatabase();
  
  try {
    const patient = await Patient.findOne({ phoneNumber });
    
    if (!patient) {
      throw new Error(`Patient with phone number ${phoneNumber} not found`);
    }
    
    let consultation;
    
    if (consultationId) {
      // Find the specific consultation
      consultation = patient.consultations.id(consultationId);
      
      if (!consultation) {
        throw new Error(`Consultation with ID ${consultationId} not found`);
      }
    } else {
      // Use the most recent consultation
      if (patient.consultations.length === 0) {
        throw new Error(`No consultations found for patient with phone number ${phoneNumber}`);
      }
      
      consultation = patient.consultations[patient.consultations.length - 1];
    }
    
    // Add the chat message
    consultation.aiChat.push({
      role: message.role,
      content: message.content,
      timestamp: new Date()
    });
    
    await patient.save();
    
    return {
      patient,
      consultation
    };
    
  } catch (error) {
    console.error('Error in appendChatMessage:', error);
    throw error;
  }
}

// Append image to a patient's consultation
export async function appendImage(
  phoneNumber: string,
  imageData: { url: string, description?: string },
  consultationId?: string
) {
  await connectToDatabase();
  
  try {
    const patient = await Patient.findOne({ phoneNumber });
    
    if (!patient) {
      throw new Error(`Patient with phone number ${phoneNumber} not found`);
    }
    
    let consultation;
    
    if (consultationId) {
      // Find the specific consultation
      consultation = patient.consultations.id(consultationId);
      
      if (!consultation) {
        throw new Error(`Consultation with ID ${consultationId} not found`);
      }
    } else {
      // Use the most recent consultation
      if (patient.consultations.length === 0) {
        throw new Error(`No consultations found for patient with phone number ${phoneNumber}`);
      }
      
      consultation = patient.consultations[patient.consultations.length - 1];
    }
    
    // Add the image
    consultation.images.push({
      url: imageData.url,
      description: imageData.description || '',
      timestamp: new Date()
    });
    
    await patient.save();
    
    return {
      patient,
      consultation
    };
    
  } catch (error) {
    console.error('Error in appendImage:', error);
    throw error;
  }
}

// Update prescription for a patient's consultation
export async function updatePrescription(
  phoneNumber: string,
  prescriptionData: {
    diagnosis: string,
    medications: Array<{
      name: string,
      dosage: string,
      frequency: string,
      duration: string
    }>,
    recommendations: string[]
  },
  consultationId?: string
) {
  await connectToDatabase();
  
  try {
    const patient = await Patient.findOne({ phoneNumber });
    
    if (!patient) {
      throw new Error(`Patient with phone number ${phoneNumber} not found`);
    }
    
    let consultation;
    
    if (consultationId) {
      // Find the specific consultation
      consultation = patient.consultations.id(consultationId);
      
      if (!consultation) {
        throw new Error(`Consultation with ID ${consultationId} not found`);
      }
    } else {
      // Use the most recent consultation
      if (patient.consultations.length === 0) {
        throw new Error(`No consultations found for patient with phone number ${phoneNumber}`);
      }
      
      consultation = patient.consultations[patient.consultations.length - 1];
    }
    
    // Update the prescription
    consultation.finalPrescription = {
      diagnosis: prescriptionData.diagnosis,
      medications: prescriptionData.medications,
      recommendations: prescriptionData.recommendations,
      generatedAt: new Date(),
      reviewedBy: consultation.finalPrescription?.reviewedBy
    };
    
    await patient.save();
    
    return {
      patient,
      consultation
    };
    
  } catch (error) {
    console.error('Error in updatePrescription:', error);
    throw error;
  }
} 