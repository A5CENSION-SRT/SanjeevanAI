// add-test-cases.js - Script to add test cases to the database
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

async function addTestCases() {
  try {
    console.log('Adding test cases to the database...');
    
    // Get all patients
    const patients = await PatientModel.find({});
    
    if (patients.length === 0) {
      console.log('No patients found. Please run the populate-db.js script first.');
      process.exit(1);
    }
    
    console.log(`Found ${patients.length} patients`);
    
    // Delete existing cases
    await CaseModel.deleteMany({});
    console.log('Cleared existing cases');
    
    // Create new cases for each patient
    const cases = [];
    
    for (const patient of patients) {
      // Create 1-2 cases per patient
      const numCases = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < numCases; i++) {
        const symptoms = ['headache', 'fever', 'cough', 'fatigue', 'nausea', 'dizziness', 'chest pain'];
        const randomSymptoms = [];
        const numSymptoms = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < numSymptoms; j++) {
          const randomIndex = Math.floor(Math.random() * symptoms.length);
          randomSymptoms.push(symptoms[randomIndex]);
        }
        
        cases.push({
          patientId: patient._id,
          transcript: `AI: Hello, how can I help you today?\nPatient: I've been experiencing ${randomSymptoms.join(' and ')} for the past few days.`,
          patientHistory: patient.medicalHistory || 'No significant medical history',
          patientInfo: {
            symptoms: randomSymptoms,
            duration: `${Math.floor(Math.random() * 7) + 1} days`
          },
          aiAnalysis: `Patient is experiencing ${randomSymptoms.join(' and ')}. Recommend consultation with a doctor.`,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Save the cases
    const savedCases = await CaseModel.insertMany(cases);
    console.log(`✅ Added ${savedCases.length} test cases`);
    
    console.log('Test cases added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test cases:', error);
    process.exit(1);
  }
}

// Run the function
addTestCases();
