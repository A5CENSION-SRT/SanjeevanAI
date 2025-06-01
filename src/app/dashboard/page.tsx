'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CurrentPatientDocument } from '@/types/mongodb';

export default function DashboardPage() {
    const router = useRouter();
    const [currentPatients, setCurrentPatients] = useState<CurrentPatientDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [doctor, setDoctor] = useState<{id: string; name: string; specialization: string} | null>(null);

    useEffect(() => {
        // Check authentication and get doctor info
        async function checkAuth() {
            try {
                // For testing purposes, use a mock doctor directly without authentication
                setDoctor({
                    id: "64f8c7a09d5b2e001f8e6b58", // Valid MongoDB ObjectId format
                    name: "Dr. Sanjeev Kumar",
                    specialization: "Neurologist"
                });
                
                // Uncomment the below for real authentication
                /*
                const authResponse = await fetch('/api/auth/check', {
                    credentials: 'include',
                });
                
                if (!authResponse.ok) {
                    // Not authenticated, redirect to login
                    router.push('/auth/login');
                    return;
                }
                
                const authData = await authResponse.json();
                
                if (authData.status === 'success' && authData.doctor) {
                    // Set doctor info from auth response
                    setDoctor({
                        id: authData.doctor.id,
                        name: authData.doctor.name,
                        specialization: authData.doctor.specialization || 'Doctor'
                    });
                } else {
                    router.push('/auth/login');
                    return;
                }
                */
            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/auth/login');
                return;
            }
        }
        
        async function fetchCurrentPatients() {
            try {
                // Use the MongoDB API endpoint (not the test endpoint)
                const response = await fetch('/api/consultations/current', {
                    credentials: 'include',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch current patients');
                }
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    console.log('Fetched current patients:', data.data);
                    setCurrentPatients(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch current patients');
                }
            } catch (error) {
                console.error('Error fetching current patients:', error);
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }
        
        checkAuth().then(() => {
            fetchCurrentPatients();
        });
    }, [router]);

    async function handleCompleteConsultation(currentPatientId: string) {
        if (!doctor) return;
        
        try {
            // Call the real API to complete consultation
            const response = await fetch('/api/consultations/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPatientId,
                    doctorId: doctor.id,
                    doctorName: doctor.name,
                    doctorComments: 'Consultation completed successfully'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to complete consultation');
            }
            
            // Remove the completed patient from the list
            setCurrentPatients(currentPatients.filter(patient => 
                patient._id.toString() !== currentPatientId
            ));
            
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
        }
    }

    if (!doctor) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-700">Current Patients</h1>
                <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                    <span className="text-indigo-700 font-medium">Welcome, {doctor.name}</span>
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-pulse flex space-x-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-200"></div>
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-indigo-200 rounded"></div>
                                <div className="h-4 bg-indigo-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                    <p>{error}</p>
                </div>
            ) : currentPatients.length === 0 ? (
                <div className="bg-blue-50 p-8 rounded-lg text-center">
                    <h3 className="text-xl font-medium text-blue-700 mb-2">No Current Patients</h3>
                    <p className="text-blue-600">There are no patients currently waiting for consultation.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentPatients.map((patient) => (
                        <div key={patient._id.toString()} className="bg-white rounded-lg shadow-lg overflow-hidden border border-indigo-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-indigo-600 text-white px-6 py-4">
                                <h3 className="text-xl font-semibold">{patient.patientName}</h3>
                                <div className="flex text-sm mt-1">
                                    <span className="mr-4">{patient.patientAge} years</span>
                                    <span>{patient.patientGender}</span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="mb-4">
                                    <span className="text-gray-500 text-sm">Last Updated:</span>
                                    <p className="text-gray-800">{new Date(patient.lastUpdated).toLocaleString()}</p>
                                </div>
                                
                                <div className="mb-4">
                                    <span className="text-gray-500 text-sm">AI Summary:</span>
                                    <p className="text-gray-800 bg-gray-50 p-2 rounded mt-1">{patient.aiSummary}</p>
                                </div>
                                
                                <div className="mt-6 space-y-3">
                                    <Link
                                        href={`/dashboard/consultations/${patient._id}`}
                                        className="block w-full bg-indigo-600 text-white text-center py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        View Consultation
                                    </Link>
                                    
                                    <button
                                        onClick={() => handleCompleteConsultation(patient._id.toString())}
                                        className="block w-full bg-green-600 text-white text-center py-2 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Complete Consultation
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 