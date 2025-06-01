import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getCompletedConsultation(consultationId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/consultations/completed/${consultationId}`, { cache: 'no-store' });

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching completed consultation:', error);
        return null;
    }
}

export default async function CompletedConsultationPage({
    params
}: {
    params: { consultationId: string }
}) {
    const consultation = await getCompletedConsultation(params.consultationId);

    if (!consultation) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{consultation.patientName}'s Completed Consultation</h1>
                    <p className="text-gray-500">
                        {consultation.patientGender}, {consultation.patientAge} years •
                        Completed on {new Date(consultation.completedDate).toLocaleDateString()}
                    </p>
                </div>
                <Link
                    href="/dashboard/completed"
                    className="text-blue-600 hover:text-blue-800"
                >
                    Back to Completed
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Prescription & Doctor Review */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Final Prescription</h2>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Completed
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                                <p className="text-gray-900">{consultation.diagnosis}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Medications</h3>
                                <div className="mt-2 space-y-2">
                                    {consultation.medications.map((med: any, index: number) => (
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
                                    {consultation.recommendations.map((rec: string, index: number) => (
                                        <li key={index} className="text-gray-700">{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Doctor's Review */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Doctor's Review</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Reviewed By</h3>
                                <p className="text-gray-900">{consultation.doctorName}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(consultation.completedDate).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Comments</h3>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-2">
                                    {consultation.doctorComments || "No comments provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 