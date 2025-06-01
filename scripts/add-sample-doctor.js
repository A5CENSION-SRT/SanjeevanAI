const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Use the same connection string that worked previously
const username = "sanjiviniapp";
const password = "Raghottam";
const clusterUrl = "sanjeeviniai.eq040vd.mongodb.net";
const connectionString = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=SanjeeviniAI`;

async function addSampleDoctor() {
    console.log("Starting to add sample doctor...");

    try {
        // Connect to MongoDB
        const client = new MongoClient(connectionString);
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Get doctor_portal database
        const db = client.db("doctor_portal");

        // Check if doctor exists
        const existingDoctor = await db.collection("doctors").findOne({ email: "dr.sanjeev@example.com" });

        if (existingDoctor) {
            console.log("Sample doctor already exists:", existingDoctor.name);
            await client.close();
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Create sample doctor
        const doctorData = {
            name: "Dr. Sanjeev Kumar",
            email: "dr.sanjeev@example.com",
            password: hashedPassword,
            specialization: "General Practitioner",
            qualification: "MBBS, MD",
            phone: "+91 9876543210",
            address: "123 Medical Center, Bangalore",
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection("doctors").insertOne(doctorData);
        console.log("Sample doctor added with ID:", result.insertedId);

        console.log("Login credentials:");
        console.log("Email: dr.sanjeev@example.com");
        console.log("Password: password123");

        await client.close();

    } catch (error) {
        console.error("Error adding sample doctor:", error);
    }
}

addSampleDoctor();