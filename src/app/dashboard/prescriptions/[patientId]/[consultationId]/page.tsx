import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

// Function to fetch a specific patient's consultation
async function getConsultation(patientId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/patients?phone=${patientId}`, { cache: 'no-store' });

        if (!res.ok) {
            throw new Error('Failed to fetch patient data');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching patient data:', error);
        return null;
    }
}

async function completeConsultation(formData: FormData) {
    'use server';

    const patientId = formData.get('patientId') as string;
    const consultationId = formData.get('consultationId') as string;
    const doctorId = formData.get('doctorId') as string; // In a real app, this would come from auth
    const doctorName = formData.get('doctorName') as string; // In a real app, this would come from auth
    const comments = formData.get('comments') as string;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    try {
        const response = await fetch(`${baseUrl}/api/consultations/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patientId,
                consultationId,
                doctorId,
                doctorName,
                comments
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to complete consultation');
        }

        // Redirect to completed consultations page
        redirect('/dashboard/completed');
    } catch (error) {
        console.error('Error completing consultation:', error);
        // In a real app, you would handle this error better
        throw error;
    }
}

export default async function ConsultationReviewPage({
    params
}: {
    params: { patientId: string, consultationId: string }
}) {
    const patient = await getConsultation(params.patientId);

    if (!patient) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Patient Not Found</h2>
                <p className="text-gray-500">The requested patient data could not be found.</p>
                <Link href="/dashboard/prescriptions" className="mt-4 inline-block text-blue-600 hover:underline">
                    Back to Prescriptions
                </Link>
            </div>
        );
    }

    // Find the specific consultation
    const consultation = patient.consultations?.find(
        (c: any) => c._id === params.consultationId
    );

    if (!consultation) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Consultation Not Found</h2>
                <p className="text-gray-500">The requested consultation data could not be found.</p>
                <Link href="/dashboard/prescriptions" className="mt-4 inline-block text-blue-600 hover:underline">
                    Back to Prescriptions
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{patient.name}'s Consultation</h1>
                    <p className="text-gray-500">{patient.gender}, {patient.age} years • {new Date(consultation.date).toLocaleDateString()}</p>
                </div>
                <Link
                    href="/dashboard/prescriptions"
                    className="text-blue-600 hover:text-blue-800"
                >
                    Back to Prescriptions
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Chat History */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">WhatsApp Conversation</h2>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {consultation.aiChat.map((message: any, index: number) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Images Section */}
                    {consultation.images && consultation.images.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Shared Images</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {consultation.images.map((img: any, index: number) => (
                                    <div key={index} className="border rounded-lg overflow-hidden">
                                        <div className="relative h-40 w-full">
                                            {/* Using a placeholder for the image since we can't load external images */}
                                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                                <p className="text-gray-500 text-sm">{img.description || 'Image'}</p>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <p className="text-xs text-gray-500">
                                                {new Date(img.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - AI Prescription */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">AI-Generated Prescription</h2>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                Pending Review
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                                <p className="text-gray-900">{consultation.finalPrescription.diagnosis}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Medications</h3>
                                <div className="mt-2 space-y-2">
                                    {consultation.finalPrescription.medications.map((med: any, index: number) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                                            <div className="flex justify-between">
                                                <p className="font-medium">{med.name}</p>
                                                <p className="text-gray-500">{med.dosage}</p>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {med.frequency}, for {med.duration}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Recommendations</h3>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {consultation.finalPrescription.recommendations.map((rec: string, index: number) => (
                                        <li key={index} className="text-gray-700">{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Doctor's Review Form */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Review</h2>
                        <form action={completeConsultation} className="space-y-4">
                            {/* Hidden fields for form submission */}
                            <input type="hidden" name="patientId" value={patient._id} />
                            <input type="hidden" name="consultationId" value={params.consultationId} />
                            <input type="hidden" name="doctorId" value="doctor123" /> {/* In a real app, this would be dynamic */}
                            <input type="hidden" name="doctorName" value="Dr. John Smith" /> {/* In a real app, this would be dynamic */}

                            <div>
                                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                                    Comments or Modifications
                                </label>
                                <textarea
                                    id="comments"
                                    name="comments"
                                    rows={4}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Add your comments or modifications to the prescription..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Link
                                    href="/dashboard/prescriptions"
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Approve & Complete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 