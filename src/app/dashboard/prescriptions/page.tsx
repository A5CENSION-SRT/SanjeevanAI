import React from 'react';
import Link from 'next/link';

async function getPendingConsultations() {
    try {
        // Use absolute URL to ensure it works in both development and production
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/patients`, { cache: 'no-store' });

        if (!res.ok) {
            throw new Error('Failed to fetch pending consultations');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching pending consultations:', error);
        return [];
    }
}

export default async function PrescriptionsPage() {
    const pendingConsultations = await getPendingConsultations();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Pending Prescriptions</h1>
                <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Refresh
                    </button>
                </div>
            </div>

            {pendingConsultations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-500">No pending prescriptions found.</p>
                    <p className="text-sm text-gray-400 mt-2">
                        New consultations from WhatsApp will appear here for your review.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Diagnosis
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingConsultations.map((patient: any) => (
                                    patient.consultations.map((consultation: any, consultIndex: number) => (
                                        consultation.status === 'pending_review' && (
                                            <tr key={`${patient._id}-${consultIndex}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {patient.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {patient.gender}, {patient.age} years
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(consultation.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(consultation.date).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {consultation.finalPrescription.diagnosis}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {consultation.finalPrescription.medications.length} medications
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Pending Review
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={`/dashboard/prescriptions/${patient._id}/${consultation._id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Review
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
} 