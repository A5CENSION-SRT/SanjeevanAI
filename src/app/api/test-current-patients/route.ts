import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Sample patient data that mimics what would come from n8n
        const samplePatients = [
            {
                _id: "683a2c2e044213001203f7ba", // MongoDB ObjectId as string
                name: "Rahul Sharma",
                age: 45,
                gender: "Male",
                contact: "+91 8765432109",
                address: "123, Main Street, Bangalore",
                medicalHistory: "Cist seen from scans in the internal part of brain",
                createdAt: "2025-05-30T22:07:42.147+00:00",
                conversation: "User: Hi, AI: How can I help you?",
                postDocReport: "Diagnosis: Intracranial Intraparenchymal Cystic Lesion. A definitive surgical plan will be established after reviewing the MRI findings in detail.",
                preDocReport: "Diagnosis: Intracranial Intraparenchymal Cystic Lesion. A definitive surgical plan will be established after reviewing the MRI findings in detail."
            },
            {
                _id: "683a2c2e044213001203f7bb",
                name: "Priya Patel",
                age: 32,
                gender: "Female",
                contact: "+91 9876543210",
                address: "456, Park Avenue, Mumbai",
                medicalHistory: "Recurring migraines with sensitivity to light",
                createdAt: "2025-05-29T18:35:12.323+00:00",
                conversation: "User: I've been having migraines more frequently lately. AI: I understand that can be difficult. How often are you experiencing them? User: Almost twice a week now, and they're getting worse. AI: Are you taking any medication for them? User: Just over-the-counter painkillers, they don't help much.",
                postDocReport: "Patient reports increasing frequency of migraine attacks. Recommend neurological evaluation and possible preventative medication.",
                preDocReport: "Assessment: Chronic migraine condition with increasing frequency. Further evaluation recommended."
            }
        ];
        
        // Process the data to match CurrentPatient model format
        const currentPatients = samplePatients.map(patient => ({
            _id: patient._id,
            patientName: patient.name,
            patientAge: patient.age,
            patientGender: patient.gender,
            patientPhone: patient.contact,
            aiSummary: patient.medicalHistory || patient.postDocReport || "No summary available",
            lastUpdated: patient.createdAt,
            consultationDate: patient.createdAt,
            status: "active",
            // Preserve original fields for UI
            conversation: patient.conversation,
            medicalHistory: patient.medicalHistory,
            postDocReport: patient.postDocReport,
            preDocReport: patient.preDocReport,
            address: patient.address
        }));
        
        return NextResponse.json({
            status: 'success',
            data: currentPatients,
            count: currentPatients.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating sample patients:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to generate sample patients',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 