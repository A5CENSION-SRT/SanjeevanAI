import React from 'react';
import Link from 'next/link';
import { CompletedConsultationDocument } from '@/types/mongodb';

async function getCompletedConsultations() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/consultations/completed`, { cache: 'no-store' });

        if (!res.ok) {
            throw new Error('Failed to fetch completed consultations');
        }

        const data = await res.json();
        return data.status === 'success' ? data.data : [];
    } catch (error) {
        console.error('Error fetching completed consultations:', error);
        return [];
    }
}

export default async function CompletedConsultationsPage() {
    const completedConsultations: CompletedConsultationDocument[] = await getCompletedConsultations();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Completed Consultations</h1>
                <div className="flex space-x-2">
                    <Link 
                        href="/dashboard/completed" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Refresh
                    </Link>
                </div>
            </div>

            {completedConsultations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-500">No completed consultations found.</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Consultations you have completed will appear here.
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
                                        Doctor
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {completedConsultations.map((consultation) => (
                                    <tr key={consultation._id.toString()}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {consultation.patientName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {consultation.patientGender}, {consultation.patientAge} years
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(consultation.completedDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(consultation.completedDate).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {consultation.diagnosis}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {consultation.medications?.length || 0} medications
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {consultation.doctorName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={`/dashboard/completed/${consultation._id.toString()}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
} 