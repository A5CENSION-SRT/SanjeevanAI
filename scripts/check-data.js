const { MongoClient } = require('mongodb');

// Use the same connection string that worked previously
const username = "sanjiviniapp";
const password = "Raghottam";
const clusterUrl = "sanjeeviniai.eq040vd.mongodb.net";
const connectionString = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=SanjeeviniAI`;

async function checkData() {
    console.log("Checking database data...");

    try {
        // Connect to MongoDB
        const client = new MongoClient(connectionString);
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Get doctor_portal database
        const db = client.db("doctor_portal");

        // Check collections
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        // Check current patients
        const currentPatients = await db.collection("currentpatients").find({}).toArray();
        console.log(`Current Patients (${currentPatients.length}):`);
        currentPatients.forEach(patient => {
            console.log(`- ${patient.patientName} (${patient.patientAge}): ${patient.status}`);
        });

        // Check completed consultations
        const completedConsultations = await db.collection("completedconsultations").find({}).toArray();
        console.log(`\nCompleted Consultations (${completedConsultations.length}):`);
        completedConsultations.forEach(consultation => {
            console.log(`- ${consultation.patientName}: ${consultation.diagnosis}`);
        });

        await client.close();

    } catch (error) {
        console.error("Error checking data:", error);
    }
}

checkData();