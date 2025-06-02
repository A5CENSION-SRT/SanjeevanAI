// test-data.js - Script to add test patient and case data
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

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

async function addTestData() {
  try {
    console.log('Adding test patient and case data...');
    
    // Create a test patient
    const patient = new PatientModel({
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      contact: '9876543210',
      email: 'john.doe@example.com',
      address: '123 Main St, Bangalore',
      medicalHistory: 'Patient has a history of hypertension and occasional migraines.'
    });
    
    const savedPatient = await patient.save();
    console.log('✅ Test patient created:', savedPatient);
    
    // Create a test case for this patient
    const newCase = new CaseModel({
      patientId: savedPatient._id,
      transcript: 'AI: Hello, how can I help you today?\nPatient: I have been experiencing severe headaches for the past week.',
      patientHistory: 'Patient reports recurring headaches for the past week.',
      patientInfo: {
        symptoms: ['headache', 'fatigue', 'dizziness'],
        duration: '1 week'
      },
      aiAnalysis: 'Patient may be suffering from migraines or tension headaches. Recommend consultation with neurologist.',
      completed: false
    });
    
    const savedCase = await newCase.save();
    console.log('✅ Test case created:', savedCase);
    
    console.log('Test data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    process.exit(1);
  }
}

// Run the function
addTestData();
