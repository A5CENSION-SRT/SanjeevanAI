const { MongoClient, ObjectId } = require('mongodb');
const mongoose = require('mongoose');

// Use the same connection string that worked previously
const username = "sanjiviniapp";
const password = "Raghottam";
const clusterUrl = "sanjeeviniai.eq040vd.mongodb.net";
const connectionString = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=SanjeeviniAI`;

async function addSampleData() {
    console.log("Starting to add sample data...");

    try {
        // Connect to MongoDB
        const client = new MongoClient(connectionString);
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Get doctor_portal database
        const db = client.db("doctor_portal");

        // Check if doctor exists, if not create a sample doctor
        const existingDoctor = await db.collection("doctors").findOne({});
        let doctorId;

        if (existingDoctor) {
            doctorId = existingDoctor._id;
            console.log("Using existing doctor:", existingDoctor.name);
        } else {
            const doctorResult = await db.collection("doctors").insertOne({
                name: "Dr. Sanjeev Kumar",
                email: "dr.sanjeev@example.com",
                specialization: "General Practitioner",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            doctorId = doctorResult.insertedId;
            console.log("Created new doctor with ID:", doctorId);
        }

        // Create sample patients
        const patientIds = [];

        // Check if patients exist
        const existingPatients = await db.collection("patients").find({}).toArray();

        if (existingPatients.length === 0) {
            const patientData = [{
                    name: "Rahul Sharma",
                    age: 35,
                    gender: "Male",
                    phoneNumber: "9876543210",
                    consultations: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: "Priya Patel",
                    age: 28,
                    gender: "Female",
                    phoneNumber: "9876543211",
                    consultations: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: "Vikram Singh",
                    age: 45,
                    gender: "Male",
                    phoneNumber: "9876543212",
                    consultations: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: "Meera Reddy",
                    age: 32,
                    gender: "Female",
                    phoneNumber: "9876543213",
                    consultations: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: "Amit Kumar",
                    age: 40,
                    gender: "Male",
                    phoneNumber: "9876543214",
                    consultations: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            for (const patient of patientData) {
                const result = await db.collection("patients").insertOne(patient);
                patientIds.push(result.insertedId);
            }
            console.log("Created 5 new patients");
        } else {
            for (const patient of existingPatients) {
                patientIds.push(patient._id);
            }
            console.log("Using existing patients");
        }

        // Add current patients
        // First, remove any existing current patients to avoid duplicates
        await db.collection("currentpatients").deleteMany({});

        // Add new current patients
        const currentPatients = [{
                patientId: patientIds[0],
                patientName: "Rahul Sharma",
                patientAge: 35,
                patientGender: "Male",
                patientPhone: "9876543210",
                consultationId: new ObjectId(),
                consultationDate: new Date(),
                lastUpdated: new Date(),
                status: "active",
                aiSummary: "Patient complains of persistent cough and mild fever for the past 3 days.",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                patientId: patientIds[1],
                patientName: "Priya Patel",
                patientAge: 28,
                patientGender: "Female",
                patientPhone: "9876543211",
                consultationId: new ObjectId(),
                consultationDate: new Date(),
                lastUpdated: new Date(),
                status: "in_review",
                aiSummary: "Patient reports recurring headaches, particularly in the morning. Possible migraine symptoms.",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection("currentpatients").insertMany(currentPatients);
        console.log("Added 2 current patients");

        // Add completed consultations
        // First, remove any existing completed consultations to avoid duplicates
        await db.collection("completedconsultations").deleteMany({});

        // Add new completed consultations
        const completedConsultations = [{
                patientId: patientIds[2],
                patientName: "Vikram Singh",
                patientAge: 45,
                patientGender: "Male",
                patientPhone: "9876543212",
                consultationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                completedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
                diagnosis: "Hypertension Stage 1",
                medications: [{
                    name: "Amlodipine",
                    dosage: "5mg",
                    frequency: "Once daily",
                    duration: "30 days"
                }],
                recommendations: [
                    "Reduce salt intake",
                    "Regular exercise for 30 minutes daily",
                    "Follow up after 4 weeks"
                ],
                doctorId: doctorId,
                doctorName: "Dr. Sanjeev Kumar",
                doctorComments: "Patient should monitor blood pressure daily and maintain a log.",
                aiChat: [{
                        role: "user",
                        content: "I've been having headaches and feeling dizzy sometimes.",
                        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    },
                    {
                        role: "assistant",
                        content: "I understand you're experiencing headaches and dizziness. Let me ask a few questions to better understand your symptoms.",
                        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                ],
                images: [],
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
            },
            {
                patientId: patientIds[3],
                patientName: "Meera Reddy",
                patientAge: 32,
                patientGender: "Female",
                patientPhone: "9876543213",
                consultationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                completedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
                diagnosis: "Acute Bronchitis",
                medications: [{
                        name: "Azithromycin",
                        dosage: "500mg",
                        frequency: "Once daily",
                        duration: "5 days"
                    },
                    {
                        name: "Acetaminophen",
                        dosage: "500mg",
                        frequency: "As needed for fever",
                        duration: "5 days"
                    }
                ],
                recommendations: [
                    "Plenty of rest and fluids",
                    "Use humidifier if available",
                    "Return if symptoms worsen"
                ],
                doctorId: doctorId,
                doctorName: "Dr. Sanjeev Kumar",
                doctorComments: "Patient showing good response to treatment. No follow-up needed unless symptoms persist.",
                aiChat: [{
                        role: "user",
                        content: "I have a cough that won't go away and slight fever.",
                        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
                    },
                    {
                        role: "assistant",
                        content: "I'm sorry to hear about your persistent cough and fever. Let's gather some more information to understand your condition better.",
                        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
                    }
                ],
                images: [],
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
            },
            {
                patientId: patientIds[4],
                patientName: "Amit Kumar",
                patientAge: 40,
                patientGender: "Male",
                patientPhone: "9876543214",
                consultationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                diagnosis: "Seasonal Allergies",
                medications: [{
                    name: "Cetirizine",
                    dosage: "10mg",
                    frequency: "Once daily",
                    duration: "14 days"
                }],
                recommendations: [
                    "Avoid known allergens",
                    "Keep windows closed during high pollen count days",
                    "Use air purifier if available"
                ],
                doctorId: doctorId,
                doctorName: "Dr. Sanjeev Kumar",
                doctorComments: "Patient may need long-term allergy management plan if symptoms recur seasonally.",
                aiChat: [{
                        role: "user",
                        content: "My eyes are itchy and I'm sneezing a lot. This happens every year around this time.",
                        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                    },
                    {
                        role: "assistant",
                        content: "It sounds like you might be experiencing seasonal allergies. Let me ask you some questions to confirm this and understand the severity.",
                        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                    }
                ],
                images: [],
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
        ];

        await db.collection("completedconsultations").insertMany(completedConsultations);
        console.log("Added 3 completed consultations");

        console.log("Sample data added successfully!");
        await client.close();

    } catch (error) {
        console.error("Error adding sample data:", error);
    }
}

addSampleData();