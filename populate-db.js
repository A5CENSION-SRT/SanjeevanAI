// populate-db.js - Script to add real patient and case data to the database
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Import models
const PatientModel = require('./src/models/Patient');
const CaseModel = require('./src/models/Case');

// Sample patient data
const patients = [
  {
    name: 'Rahul Sharma',
    age: 42,
    gender: 'Male',
    contact: '9876543210',
    email: 'rahul.sharma@example.com',
    address: '123 MG Road, Bangalore',
    medicalHistory: 'Patient has a history of hypertension and type 2 diabetes.'
  },
  {
    name: 'Priya Patel',
    age: 28,
    gender: 'Female',
    contact: '8765432109',
    email: 'priya.patel@example.com',
    address: '456 Indiranagar, Bangalore',
    medicalHistory: 'Patient has asthma and occasional migraines.'
  },
  {
    name: 'Amit Kumar',
    age: 35,
    gender: 'Male',
    contact: '7654321098',
    email: 'amit.kumar@example.com',
    address: '789 HSR Layout, Bangalore',
    medicalHistory: 'Patient has no significant medical history.'
  },
  {
    name: 'Sneha Reddy',
    age: 31,
    gender: 'Female',
    contact: '6543210987',
    email: 'sneha.reddy@example.com',
    address: '101 Koramangala, Bangalore',
    medicalHistory: 'Patient has allergies to penicillin and seasonal pollen.'
  }
];

// Function to add patients and cases
async function populateDatabase() {
  try {
    console.log('Adding patients and cases to the database...');
    
    // Clear existing data (optional)
    await PatientModel.deleteMany({});
    await CaseModel.deleteMany({});
    console.log('Cleared existing data');
    
    // Add patients
    const savedPatients = await PatientModel.insertMany(patients);
    console.log(`✅ Added ${savedPatients.length} patients`);
    
    // Create cases for each patient
    const cases = savedPatients.map((patient, index) => ({
      patientId: patient._id,
      transcript: `AI: Hello, how can I help you today?\nPatient: I've been experiencing ${index % 2 === 0 ? 'headaches and fatigue' : 'fever and body aches'} for the past few days.`,
      patientHistory: patient.medicalHistory,
      patientInfo: {
        symptoms: index % 2 === 0 ? ['headache', 'fatigue', 'dizziness'] : ['fever', 'body ache', 'cough'],
        duration: `${index + 1} days`
      },
      aiAnalysis: index % 2 === 0 
        ? 'Patient may be suffering from stress or tension headaches. Recommend consultation with a neurologist.' 
        : 'Patient may have a viral infection. Recommend rest, fluids, and antipyretics.',
      completed: false
    }));
    
    const savedCases = await CaseModel.insertMany(cases);
    console.log(`✅ Added ${savedCases.length} cases`);
    
    console.log('Database populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating database:', error);
    process.exit(1);
  }
}

// Run the function
populateDatabase();
