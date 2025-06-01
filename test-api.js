// test-api.js
require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Check if models are correctly loaded
    console.log('Checking models...');
    
    // Load models
    const Case = mongoose.models.Case || mongoose.model('Case', require('./src/models/Case'));
    const Patient = mongoose.models.Patient || mongoose.model('Patient', require('./src/models/Patient'));
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('./src/models/Doctor'));
    const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', require('./src/models/Appointment'));
    
    console.log('✅ Models loaded successfully');
    
    // Count documents in each collection
    const caseCount = await Case.countDocuments();
    const patientCount = await Patient.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    
    console.log(`Cases: ${caseCount}`);
    console.log(`Patients: ${patientCount}`);
    console.log(`Doctors: ${doctorCount}`);
    console.log(`Appointments: ${appointmentCount}`);
    
    console.log('✅ API routes should be working correctly');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

startServer();
