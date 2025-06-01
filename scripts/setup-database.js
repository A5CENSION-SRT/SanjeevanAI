// scripts/setup-database.js
const { MongoClient } = require('mongodb');

// Use hardcoded credentials that we know work
const username = "sanjiviniapp";
const password = "Raghottam";
const clusterUrl = "sanjeeviniai.eq040vd.mongodb.net";
const connectionString = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=SanjeeviniAI`;

async function setupDatabase() {
    console.log("Starting database setup...");

    try {
        const client = new MongoClient(connectionString);
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Create doctor_portal database
        const db = client.db("doctor_portal");
        console.log("Created doctor_portal database");

        // Create collections
        await db.createCollection("doctors");
        console.log("Created doctors collection");

        await db.createCollection("patients");
        console.log("Created patients collection");

        await db.createCollection("appointments");
        console.log("Created appointments collection");

        await db.createCollection("medical_records");
        console.log("Created medical_records collection");

        // Insert sample doctor data
        await db.collection("doctors").insertOne({
            name: "Dr. Sanjeev Kumar",
            specialization: "Cardiologist",
            experience: 15,
            email: "dr.sanjeev@example.com",
            phone: "+91 9876543210",
            createdAt: new Date()
        });
        console.log("Added sample doctor data");

        // Insert sample patient data
        await db.collection("patients").insertOne({
            name: "Rahul Sharma",
            age: 45,
            gender: "Male",
            contact: "+91 8765432109",
            address: "123, Main Street, Bangalore",
            medicalHistory: "Hypertension",
            createdAt: new Date()
        });
        console.log("Added sample patient data");

        console.log("Database setup completed successfully!");
        await client.close();

    } catch (error) {
        console.error("Error setting up database:", error);

        if (error.code === 8000 || error.message.includes("Authentication failed")) {
            console.log("\nAuthentication failed. Please check your MongoDB Atlas username and password.");
            console.log("Make sure your .env file contains the correct credentials.");
        }
    }
}

setupDatabase();