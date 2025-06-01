// verify-db.js - Script to verify database connection and data
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Original MongoDB URI:', uri);
    
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
    
    console.log('Using connection URI with doctor_portal database:', connectionUri);
    await mongoose.connect(connectionUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
    console.log("Database name:", mongoose.connection.name);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📚 Collections in database:");
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Import models
    const PatientModel = require('./src/models/Patient');
    const CaseModel = require('./src/models/Case');
    
    // Count documents in each collection
    const patientCount = await PatientModel.countDocuments();
    const caseCount = await CaseModel.countDocuments();
    
    console.log("\n📊 Document counts:");
    console.log(`- Patients: ${patientCount}`);
    console.log(`- Cases: ${caseCount}`);
    
    // Get sample data
    if (patientCount > 0) {
      const patients = await PatientModel.find().limit(3).lean();
      console.log("\n👤 Sample patients:");
      patients.forEach((patient, index) => {
        console.log(`\nPatient ${index + 1}:`);
        console.log(`- ID: ${patient._id}`);
        console.log(`- Name: ${patient.name}`);
        console.log(`- Age: ${patient.age}`);
        console.log(`- Gender: ${patient.gender}`);
      });
    }
    
    if (caseCount > 0) {
      const cases = await CaseModel.find().limit(3).lean();
      console.log("\n📋 Sample cases:");
      cases.forEach((caseItem, index) => {
        console.log(`\nCase ${index + 1}:`);
        console.log(`- ID: ${caseItem._id}`);
        console.log(`- Patient ID: ${caseItem.patientId}`);
        console.log(`- Completed: ${caseItem.completed}`);
        console.log(`- Approved: ${caseItem.approved}`);
      });
      
      // Check for active cases
      const activeCases = await CaseModel.find({ completed: false }).countDocuments();
      console.log(`\n⚠️ Active cases (completed=false): ${activeCases}`);
    }
    
    console.log("\n✅ Database verification complete");
  } catch (error) {
    console.error("❌ Error verifying database:", error);
  } finally {
    process.exit(0);
  }
}

// Run the verification
connectToDatabase();
