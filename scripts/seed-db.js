// This script seeds the MongoDB database with sample data
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor_portal';
const dbName = process.env.MONGODB_DB || 'doctor_portal';

async function seedDatabase() {
  console.log('🔄 Starting database seed process...');
  
  try {
    // Connect to MongoDB
    console.log(`📡 Connecting to MongoDB at: ${uri}`);
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const DoctorSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      specialization: { type: String, required: true },
    }, {
      timestamps: true
    });
    
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
    
    // Create a doctor if none exists
    const existingDoctors = await Doctor.find({});
    
    if (existingDoctors.length === 0) {
      console.log('👨‍⚕️ Creating sample doctor...');
      const doctor = new Doctor({
        name: 'Dr. Sharma',
        email: 'doctor@example.com',
        specialization: 'General Physician',
      });
      await doctor.save();
      console.log(`✅ Created doctor: ${doctor.name} (${doctor._id})`);
    } else {
      console.log(`⏩ Doctors already exist, skipping creation`);
    }
    
    // Create test patient data
    const PatientSchema = new mongoose.Schema({
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, required: true },
      phoneNumber: { type: String, required: true, unique: true },
      consultations: [{
        date: { type: Date, default: Date.now },
        aiChat: [{
          role: { type: String, enum: ['user', 'assistant'], required: true },
          content: { type: String, required: true },
          timestamp: { type: Date, default: Date.now }
        }],
        images: [{
          url: { type: String, required: true },
          description: { type: String },
          timestamp: { type: Date, default: Date.now }
        }],
        finalPrescription: {
          diagnosis: { type: String, required: true },
          medications: [{
            name: { type: String, required: true },
            dosage: { type: String, required: true },
            frequency: { type: String, required: true },
            duration: { type: String, required: true }
          }],
          recommendations: [String],
          generatedAt: { type: Date, default: Date.now },
          reviewedBy: {
            doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
            reviewedAt: Date,
            comments: String
          }
        },
        status: {
          type: String,
          enum: ['pending_review', 'reviewed', 'completed'],
          default: 'pending_review'
        }
      }]
    }, {
      timestamps: true
    });
    
    const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
    
    // Create test patients if none exist
    const existingPatients = await Patient.find({});
    
    if (existingPatients.length === 0) {
      console.log('👨‍⚕️ Creating sample patients...');
      
      const testPatients = [
        {
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
                content: "I understand you're experiencing headaches and dizziness. How long do these episodes typically last?",
                timestamp: new Date()
              },
              {
                role: "user",
                content: "The headaches last for several hours, usually worse in the morning.",
                timestamp: new Date()
              }
            ],
            images: [
              {
                url: "https://example.com/medical-report.jpg",
                description: "Previous medical report",
                timestamp: new Date()
              }
            ],
            finalPrescription: {
              diagnosis: "Tension Headache",
              medications: [
                {
                  name: "Ibuprofen",
                  dosage: "400mg",
                  frequency: "Twice daily",
                  duration: "5 days"
                }
              ],
              recommendations: [
                "Take regular breaks from computer work",
                "Ensure proper posture while working"
              ],
              generatedAt: new Date()
            },
            status: "pending_review"
          }]
        },
        {
          name: "Sarah Johnson",
          age: 32,
          gender: "female",
          phoneNumber: "+9876543210",
          consultations: [{
            date: new Date(),
            aiChat: [
              {
                role: "user",
                content: "I have a persistent cough that won't go away",
                timestamp: new Date()
              },
              {
                role: "assistant",
                content: "I'm sorry to hear about your cough. How long have you had it?",
                timestamp: new Date()
              }
            ],
            images: [],
            finalPrescription: {
              diagnosis: "Acute Bronchitis",
              medications: [
                {
                  name: "Dextromethorphan",
                  dosage: "10ml",
                  frequency: "Every 4 hours",
                  duration: "7 days"
                }
              ],
              recommendations: [
                "Stay hydrated",
                "Rest well",
                "Avoid irritants like smoke"
              ],
              generatedAt: new Date()
            },
            status: "pending_review"
          }]
        }
      ];
      
      for (const patientData of testPatients) {
        const patient = new Patient(patientData);
        await patient.save();
        console.log(`✅ Created patient: ${patient.name}`);
        
        // Create current patient entry
        const CurrentPatientSchema = new mongoose.Schema({
          patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
          patientName: { type: String, required: true },
          patientAge: { type: Number, required: true },
          patientGender: { type: String, required: true },
          patientPhone: { type: String, required: true },
          consultationId: { type: mongoose.Schema.Types.ObjectId, required: true },
          consultationDate: { type: Date, default: Date.now },
          lastUpdated: { type: Date, default: Date.now },
          status: { 
            type: String, 
            enum: ['active', 'in_review'], 
            default: 'active' 
          },
          aiSummary: { type: String, default: '' },
          medicalJargon: { type: String, default: '' },
          researchAnlysisDiagnosis: { type: String, default: '' },
          researchFormatMD: { type: String, default: '' },
          researchFormatAgent: { type: String, default: '' },

        }, {
          timestamps: true
        });
        
        const CurrentPatient = mongoose.models.CurrentPatient || 
          mongoose.model('CurrentPatient', CurrentPatientSchema);
        
        const currentPatient = new CurrentPatient({
          patientId: patient._id,
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          patientPhone: patient.phoneNumber,
          consultationId: patient.consultations[0]._id,
          aiSummary: patient.consultations[0].aiChat[patient.consultations[0].aiChat.length - 1].content.substring(0, 100),
        });
        
        await currentPatient.save();
        console.log(`✅ Added to current patients: ${patient.name}`);
      }
    } else {
      console.log(`⏩ Patients already exist, skipping creation`);
    }
    
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

seedDatabase(); 