'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CurrentPatientDocument } from '@/types/mongodb';
import Image from 'next/image';

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [consultation, setConsultation] = useState<CurrentPatientDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState<{name: string; dosage: string; frequency: string; duration: string}[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [recommendations, setRecommendations] = useState<string[]>(['']);
  const [aiChat, setAiChat] = useState<Array<{role: string; content: string; timestamp: Date}>>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const consultationId = params && typeof params.id === 'string' 
    ? params.id 
    : params && Array.isArray(params.id) 
      ? params.id[0] 
      : '';

  useEffect(() => {
    async function fetchConsultation() {
      try {
        // Fetch from real MongoDB API endpoint
        const response = await fetch(`/api/consultations/current`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch consultation');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          console.log('Fetched patient data:', data.data);
          console.log('Looking for consultation with ID:', consultationId);
          
          // Find the consultation with matching ID
          const foundConsultation = data.data.find((patient: any) => {
            // Compare as strings to handle both ObjectId and string formats
            const patientId = typeof patient._id === 'object' && patient._id !== null && 'toString' in patient._id
              ? patient._id.toString() 
              : String(patient._id);
            const searchId = typeof consultationId === 'string' 
              ? consultationId 
              : String(consultationId);
              
            console.log(`Comparing ${patientId} with ${searchId}`);
            return patientId === searchId;
          });
          
          if (foundConsultation) {
            console.log('Found consultation:', foundConsultation);
            setConsultation(foundConsultation);
            
            // Parse conversation from the n8n workflow format if available
            if (foundConsultation.conversation) {
              try {
                // If conversation is a string, try to parse it into chat format
                const conversationString = foundConsultation.conversation;
                
                // Simple parsing logic for "User: message, AI: response" format
                const conversationParts = conversationString.split(/(?:User:|AI:)/g).filter(Boolean);
                const parsedChat = [];
                
                for (let i = 0; i < conversationParts.length; i++) {
                  const content = conversationParts[i].trim();
                  if (content) {
                    parsedChat.push({
                      role: i % 2 === 0 ? 'user' : 'assistant',
                      content: content,
                      timestamp: new Date()
                    });
                  }
                }
                
                if (parsedChat.length > 0) {
                  setAiChat(parsedChat);
                }
              } catch (parseError) {
                console.error('Failed to parse conversation:', parseError);
              }
            } else {
              // Fall back to fetching AI chat history if conversation isn't available
              try {
                const chatResponse = await fetch(`/api/consultations/${consultationId}/chat`);
                if (chatResponse.ok) {
                  const chatData = await chatResponse.json();
                  if (chatData.aiChat) {
                    setAiChat(chatData.aiChat);
                  }
                }
              } catch (chatError) {
                console.error('Failed to fetch chat history:', chatError);
              }
            }
            
            // Also handle medical history if available
            if (foundConsultation.medicalHistory) {
              setDiagnosis(foundConsultation.medicalHistory);
            }
            
            // Pre-populate prescription if available
            if (foundConsultation.prescription) {
              setDiagnosis(foundConsultation.prescription.diagnosis || '');
              
              if (foundConsultation.prescription.medications && foundConsultation.prescription.medications.length > 0) {
                setMedications(foundConsultation.prescription.medications);
              }
              
              if (foundConsultation.prescription.recommendations && foundConsultation.prescription.recommendations.length > 0) {
                setRecommendations(foundConsultation.prescription.recommendations);
              }
            }
            
          } else {
            console.error('Consultation not found. Available IDs:', 
              data.data.map((p: any) => p._id));
            throw new Error('Consultation not found');
          }
        } else {
          throw new Error(data.message || 'Failed to fetch consultation');
        }
      } catch (error) {
        console.error('Error in fetchConsultation:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    if (consultationId) {
      fetchConsultation();
    }
  }, [consultationId]);

  // Handle medication form
  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setMedications(updatedMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      const updatedMedications = [...medications];
      updatedMedications.splice(index, 1);
      setMedications(updatedMedications);
    }
  };

  // Handle recommendations
  const handleRecommendationChange = (index: number, value: string) => {
    const updatedRecommendations = [...recommendations];
    updatedRecommendations[index] = value;
    setRecommendations(updatedRecommendations);
  };

  const addRecommendation = () => {
    setRecommendations([...recommendations, '']);
  };

  const removeRecommendation = (index: number) => {
    if (recommendations.length > 1) {
      const updatedRecommendations = [...recommendations];
      updatedRecommendations.splice(index, 1);
      setRecommendations(updatedRecommendations);
    }
  };

  // Handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Create previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  async function handleCompleteConsultation() {
    if (!consultation) return;
    
    try {
      setSubmitting(true);
      
      // Use test doctor data with valid ObjectId
      const testDoctorId = "64f8c7a09d5b2e001f8e6b58"; // Valid MongoDB ObjectId format
      const testDoctorName = "Dr. Sanjeev Kumar";
      
      // First, upload any images if present
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
        
        const imageUploadResponse = await fetch('/api/consultations/upload-images', {
          method: 'POST',
          body: formData
        });
        
        if (!imageUploadResponse.ok) {
          throw new Error('Failed to upload images');
        }
        
        const imageData = await imageUploadResponse.json();
        uploadedImageUrls = imageData.imageUrls;
      }
      
      // Prepare final prescription data
      const prescriptionData = {
        diagnosis,
        medications: medications.filter(med => med.name.trim() !== ''),
        recommendations: recommendations.filter(rec => rec.trim() !== ''),
        imageUrls: uploadedImageUrls
      };
      
      // Submit completed consultation
      const response = await fetch('/api/consultations/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPatientId: consultation._id,
          doctorId: testDoctorId,
          doctorName: testDoctorName,
          doctorComments: doctorNotes,
          prescription: prescriptionData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to complete consultation: ${errorData.error || errorData.message}`);
      }
      
      router.push('/dashboard');
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <p>{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md" role="alert">
          <p>Consultation not found</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-700">Patient Consultation</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Patient Info and Chat */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-indigo-100">
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h3 className="text-xl font-semibold">{consultation.patientName}</h3>
              <div className="flex text-sm mt-1">
                <span className="mr-4">{consultation.patientAge} years</span>
                <span>{consultation.patientGender}</span>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Patient Information</h4>
              <div className="bg-gray-50 p-4 rounded">
                <p><span className="font-medium">Phone:</span> {consultation.patientPhone}</p>
                {consultation.address && (
                  <p><span className="font-medium">Address:</span> {consultation.address}</p>
                )}
                <p><span className="font-medium">Status:</span> {consultation.status === 'active' ? 
                  <span className="text-green-600">Active</span> : 
                  <span className="text-amber-600">In Review</span>
                }</p>
                <p><span className="font-medium">Consultation Date:</span> {new Date(consultation.consultationDate).toLocaleString()}</p>
                <p><span className="font-medium">Last Updated:</span> {new Date(consultation.lastUpdated).toLocaleString()}</p>
                
                {consultation.medicalHistory && (
                  <div className="mt-4">
                    <p className="font-medium">Medical History:</p>
                    <div className="bg-white p-3 mt-1 border border-gray-200 rounded">
                      {consultation.medicalHistory}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* AI Chat History */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-indigo-100">
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h3 className="text-xl font-semibold">Patient-AI Conversation</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {aiChat.length > 0 ? (
                  aiChat.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user' 
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
                  ))
                ) : consultation.conversation ? (
                  <div className="bg-white p-3 border border-gray-200 rounded">
                    <p className="italic text-gray-500 mb-2">Raw conversation:</p>
                    <p className="whitespace-pre-line">{consultation.conversation}</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No conversation history available
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* AI Summary */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-indigo-100">
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h3 className="text-xl font-semibold">AI Summary</h3>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50 p-4 rounded">
                <p>{consultation.aiSummary}</p>
              </div>
              
              {consultation.preDocReport && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Pre-Doctor Report</h4>
                  <div className="bg-yellow-50 p-4 rounded">
                    <p>{consultation.preDocReport}</p>
                  </div>
                </div>
              )}
              
              {consultation.postDocReport && consultation.postDocReport !== consultation.preDocReport && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Post-Doctor Report</h4>
                  <div className="bg-green-50 p-4 rounded">
                    <p>{consultation.postDocReport}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Prescription and Notes */}
        <div className="space-y-6">
          {/* Prescription Form */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-indigo-100">
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h3 className="text-xl font-semibold">Prescription</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Diagnosis */}
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis
                </label>
                <input
                  type="text"
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter diagnosis"
                />
              </div>
              
              {/* Medications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medications
                </label>
                {medications.map((med, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Medicine"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Dosage"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Frequency"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Duration"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                        title="Remove medication"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMedication}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mt-2"
                >
                  <span className="mr-1">+</span> Add Medication
                </button>
              </div>
              
              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommendations
                </label>
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={rec}
                      onChange={(e) => handleRecommendationChange(index, e.target.value)}
                      className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Recommendation"
                    />
                    <button
                      type="button"
                      onClick={() => removeRecommendation(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Remove recommendation"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRecommendation}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mt-2"
                >
                  <span className="mr-1">+</span> Add Recommendation
                </button>
              </div>
              
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription Images
                </label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="w-24 h-24 border rounded overflow-hidden">
                        <Image 
                          src={preview} 
                          width={96} 
                          height={96} 
                          alt={`Image ${index + 1}`} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-indigo-600 border border-indigo-600 px-3 py-1 rounded text-sm hover:bg-indigo-50"
                >
                  Upload Images
                </button>
              </div>
            </div>
          </div>
          
          {/* Doctor Notes */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-indigo-100">
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h3 className="text-xl font-semibold">Doctor Notes</h3>
            </div>
            
            <div className="p-6">
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={5}
                placeholder="Add your notes about this consultation..."
              ></textarea>
            </div>
          </div>
          
          {/* Complete Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCompleteConsultation}
              disabled={submitting}
              className={`px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Submitting...' : 'Complete Consultation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 