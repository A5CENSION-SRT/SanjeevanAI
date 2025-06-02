'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CurrentPatientDocument } from '@/types/mongodb';

// Type helpers for nested text properties
type TextContainer = { text: string } | { [key: string]: any };

// Ensure TypeScript recognizes all fields we're using
interface PatientWithCase {
    _id: string | { toString(): string };
    caseId?: string;
    name: string;
    age: number;
    gender: string;
    
    // Fields that may contain nested text properties
    medicalHistory?: string | TextContainer;
    aiSummary?: string | TextContainer;
    summary?: string | TextContainer;
    
    // Other fields
    transcript?: string;
    research?: string;
    prescription?: string;
    completed?: boolean;
    approved?: boolean;
    lastUpdated?: string;
    contactDetails?: {
        phone: string;
        email: string;
    };
    createdAt?: string;
    
    // Additional fields from MongoDB documents
    faq?: {
      [key: string]: any;
    };
    approvalHistory?: any[];
    
    // Allow any other properties for flexibility
    [key: string]: any;
}
  

export default function DashboardPage() {
    const router = useRouter();
    const [currentPatients, setCurrentPatients] = useState<PatientWithCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approvalLoading, setApprovalLoading] = useState<{[key: string]: boolean}>({});
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

    async function handleCompleteConsultation(patientId: string) {
        try {
            if (!doctor) {
                throw new Error('Doctor information not available');
            }
            
            // Find the patient in the current list to get the caseId
            const patient = currentPatients.find(p => p._id.toString() === patientId);
            if (!patient || !patient.caseId) {
                throw new Error('Cannot complete consultation: No case ID found for this patient');
            }
            
            console.log('Completing consultation for case:', patient.caseId);
            
            const response = await fetch('/api/consultations/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPatientId: patient.caseId,
                    doctorId: doctor.id,
                    doctorName: doctor.name,
                    doctorComments: 'Consultation completed successfully',
                    prescription: 'Take medication as prescribed.'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to complete consultation');
            }
            
            const result = await response.json();
            console.log('Consultation completed successfully:', result);
            
            // Remove the completed patient from the list
            setCurrentPatients(currentPatients.filter(p => 
                p._id.toString() !== patientId
            ));
            
            // Show success message
            alert('Consultation completed successfully! The case has been moved to completed cases.');
            
        } catch (error) {
            console.error('Error completing consultation:', error);
            setError(error instanceof Error ? error.message : 'An error occurred');
        }
    }
    
    async function handleApproval(caseId: string, approved: boolean) {
        console.log('handleApproval called with:', { caseId, approved });
        
        // Safety check - make sure caseId exists
        if (!caseId) {
            console.error('No caseId provided to handleApproval');
            alert('Error: Unable to identify the case for approval');
            return;
        }
        
        // Prompt for doctor notes
        const doctorNotes = prompt("Enter any notes for this case (optional):", "");
        
        // Prompt for prescription if approving
        let prescriptionText = "";
        if (approved) {
            prescriptionText = prompt("Enter prescription for this patient (optional):", "") || "";
        }
        
        // Set loading state for this specific case
        setApprovalLoading(prev => ({ ...prev, [caseId]: true }));
        
        try {
            if (!doctor) {
                throw new Error('Doctor information not available');
            }
            
            console.log(`${approved ? 'Approving' : 'Rejecting'} case:`, caseId);
            
            // Create the request payload
            const payload = {
                caseId,
                approved,
                doctorId: doctor.id || 'unknown',
                doctorName: doctor.name || 'Doctor',
                doctorNotes: doctorNotes || `${doctor.name || 'Doctor'} ${approved ? 'approved' : 'rejected'} this case`,
                prescription: prescriptionText || undefined
            };
            
            console.log('Sending approval request with payload:', payload);
            
            const response = await fetch('/api/consultations/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            console.log('Approval API response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error response:', errorData);
                throw new Error(errorData.message || errorData.error || `Failed to ${approved ? 'approve' : 'reject'} case`);
            }
            
            const result = await response.json();
            console.log(`Case ${approved ? 'approved' : 'rejected'} successfully:`, result);
            
            // Update the patient status in the UI
            setCurrentPatients(prevPatients => 
                prevPatients.map(patient => 
                    patient.caseId?.toString() === caseId ? { ...patient, approved } : patient
                )
            );
            
            // Show success message
            alert(`Case ${approved ? 'approved' : 'rejected'} successfully!`);
            
        } catch (error) {
            console.error(`Error ${approved ? 'approving' : 'rejecting'} case:`, error);
            setError(error instanceof Error ? error.message : 'An error occurred');
            alert(`Failed to ${approved ? 'approve' : 'reject'} case: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            // Clear loading state
            setApprovalLoading(prev => {
                const newState = { ...prev };
                delete newState[caseId];
                return newState;
            });
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
                    <p>{error || ''}</p>
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
                                <h3 className="text-xl font-semibold">
                                    {patient.name || patient.patientName || 'Unknown Patient'}
                                </h3>
                                <div className="flex text-sm mt-1">
                                    <span className="mr-4">
                                        {patient.age || patient.patientAge || 'Unknown'} years
                                    </span>
                                    <span>{patient.gender || patient.patientGender || 'Unknown'}</span>
                                </div>
                                {patient.contact && (
                                    <div className="text-sm mt-1">
                                        Contact: {patient.contact}
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-6">
                                <div className="mb-4">
                                    <span className="text-gray-500 text-sm">Last Updated:</span>
                                    <p className="text-gray-800">{new Date(patient.lastUpdated || patient.updatedAt || patient.createdAt || new Date()).toLocaleString()}</p>
                                </div>
                                
                                {/* Patient-AI Conversation */}
                                {patient.transcript && (
                                    <div className="mb-4">
                                        <span className="text-gray-500 text-sm font-medium">Conversation:</span>
                                        <p className="text-gray-800 bg-gray-50 p-2 rounded mt-1 text-sm max-h-20 overflow-y-auto">
                                            {patient.transcript.length > 150 ? 
                                                `${patient.transcript.substring(0, 150)}...` : 
                                                patient.transcript
                                            }
                                        </p>
                                    </div>
                                )}
                                
                                {/* Medical History */}
                                {patient.medicalHistory && (
                                    <div className="mb-4">
                                        <span className="text-gray-500 text-sm font-medium">Medical History:</span>
                                        <p className="text-gray-800 bg-gray-50 p-2 rounded mt-1">
                                            {typeof patient.medicalHistory === 'string' 
                                                ? patient.medicalHistory 
                                                : typeof patient.medicalHistory === 'object' && patient.medicalHistory && 'text' in patient.medicalHistory
                                                    ? patient.medicalHistory.text as string
                                                    : typeof patient.medicalHistory === 'object' && patient.medicalHistory
                                                        ? JSON.stringify(patient.medicalHistory, null, 2)
                                                        : 'No medical history available'
                                            }
                                        </p>
                                    </div>
                                )}
                                
                                {/* AI Summary */}
                                <div className="mb-4">
                                    <span className="text-gray-500 text-sm font-medium">AI Summary:</span>
                                    <p className="text-gray-800 bg-gray-50 p-2 rounded mt-1">
                                        {(() => {
                                            // Try to extract text from summary or aiSummary
                                            if (typeof patient.summary === 'string') {
                                                return patient.summary;
                                            } else if (typeof patient.summary === 'object' && patient.summary && 'text' in patient.summary) {
                                                return patient.summary.text as string;
                                            } else if (typeof patient.aiSummary === 'string') {
                                                return patient.aiSummary;
                                            } else if (typeof patient.aiSummary === 'object' && patient.aiSummary) {
                                                if (patient.aiSummary && 'text' in patient.aiSummary) {
                                                    return (patient.aiSummary as any).text as string;
                                                } else {
                                                    // Try to extract meaningful content from the object
                                                    try {
                                                        // If it's a JSON string that was parsed into an object
                                                        const obj = patient.aiSummary;
                                                        if (obj.text) return obj.text;
                                                        if (obj.content) return obj.content;
                                                        if (obj.summary) return obj.summary;
                                                        if (obj.description) return obj.description;
                                                        
                                                        // If we couldn't find a specific field, return a clean version
                                                        return 'AI analysis available';
                                                    } catch (e) {
                                                        return 'No summary available';
                                                    }
                                                }
                                            }
                                            return 'No summary available';
                                        })()}
                                    </p>
                                </div>
                                
                                {/* Research Data */}
                                {patient.research && (
                                    <div className="mb-4">
                                        <span className="text-gray-500 text-sm font-medium">Research:</span>
                                        <p className="text-gray-800 bg-gray-50 p-2 rounded mt-1 text-sm">{patient.research}</p>
                                    </div>
                                )}
                                
                                {/* Prescription */}
                                {patient.prescription && (
                                    <div className="mb-4">
                                        <span className="text-gray-500 text-sm font-medium">Prescription:</span>
                                        <p className="text-gray-800 bg-gray-50 p-2 rounded mt-1 text-sm">
                                            {patient.prescription.length > 100 ? 
                                                `${patient.prescription.substring(0, 100)}...` : 
                                                patient.prescription
                                            }
                                        </p>
                                    </div>
                                )}
                                
                                <div className="mt-6 space-y-3">
                                    <Link
                                        href={`/dashboard/consultations/${patient.caseId || patient._id}`}
                                        className="block w-full bg-indigo-600 text-white text-center py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        View Consultation
                                    </Link>
                                    
                                    <button
                                        onClick={() => handleCompleteConsultation(patient._id.toString())}
                                        className="block w-full bg-green-600 text-white text-center py-2 rounded-md hover:bg-green-700 transition-colors"
                                        disabled={patient.completed}
                                    >
                                        {patient.completed ? 'Consultation Completed' : 'Complete Consultation'}
                                    </button>
                                    
                                    {/* Approval Buttons */}
                                    <div className="mt-3">
                                        <p className="text-gray-700 text-sm mb-2 font-medium">Doctor Approval:</p>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    console.log('Yes button clicked for patient:', patient);
                                                    const id = patient.caseId || patient._id;
                                                    if (id) {
                                                        const caseIdStr = typeof id === 'string' ? id : id.toString();
                                                        console.log('Using caseId for approval:', caseIdStr);
                                                        handleApproval(caseIdStr, true);
                                                    } else {
                                                        console.error('No caseId found for patient:', patient);
                                                        alert('Error: No case ID found for this patient');
                                                    }
                                                }}
                                                className="flex-1 bg-green-500 text-white text-center py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={approvalLoading[patient.caseId?.toString() || patient._id?.toString() || ''] || patient.approved === true}
                                            >
                                                {approvalLoading[patient.caseId?.toString() || patient._id?.toString() || ''] ? 'Processing...' : 'Yes'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    console.log('No button clicked for patient:', patient);
                                                    const id = patient.caseId || patient._id;
                                                    if (id) {
                                                        const caseIdStr = typeof id === 'string' ? id : id.toString();
                                                        console.log('Using caseId for approval:', caseIdStr);
                                                        handleApproval(caseIdStr, false);
                                                    } else {
                                                        console.error('No caseId found for patient:', patient);
                                                        alert('Error: No case ID found for this patient');
                                                    }
                                                }}
                                                className="flex-1 bg-red-500 text-white text-center py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={approvalLoading[patient.caseId?.toString() || patient._id?.toString() || ''] || patient.approved === false}
                                            >
                                                {approvalLoading[patient.caseId?.toString() || patient._id?.toString() || ''] ? 'Processing...' : 'No'}
                                            </button>
                                        </div>
                                        <div className="text-xs text-center mt-1 text-gray-500">
                                            Status: {patient.approved === true ? '✅ Approved' : patient.approved === false ? '❌ Rejected' : '⏳ Pending'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}