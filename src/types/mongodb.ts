// Add Mongoose model-based document types for use with mongoose-based code
import { Document, Types } from 'mongoose';
import { IDoctor } from '@/lib/db/models/Doctor';
import { ICurrentPatient } from '@/lib/db/models/CurrentPatient';
import { IPatient } from '@/lib/db/models/Patient';
import { ICompletedConsultation } from '@/lib/db/models/CompletedConsultation';

export interface DoctorDocument extends IDoctor, Document {
  _id: Types.ObjectId;
}

export interface MongooseCurrentPatientDocument extends ICurrentPatient, Document {
  _id: Types.ObjectId;
  address?: string;
  medicalHistory?: string;
  conversation?: string;
  preDocReport?: string;
  postDocReport?: string;
  name?: string;
  age?: number;
  gender?: string;
  contact?: string;
}

export interface MongoosePatientDocument extends IPatient, Document {
  _id: Types.ObjectId;
}

export interface CompletedConsultationDocument extends ICompletedConsultation, Document {
  _id: Types.ObjectId;
}

// Types for MongoDB documents

// Type definition for current patient document as returned by the API
export interface CurrentPatientDocument {
  // Required fields
  _id: string | { toString(): string };
  
  // Patient information fields (could be either patientName or name format)
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  name?: string;
  age?: number;
  gender?: string;
  
  // Case reference
  caseId?: string | null | { toString(): string };
  
  // Contact information
  contact?: string;
  email?: string;
  address?: string;
  
  // Medical information
  aiSummary?: string;
  medicalHistory?: string | { text?: string; [key: string]: any };
  summary?: string;
  
  // Timestamps
  lastUpdated?: string | Date;
  consultationDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  // Status information
  status?: string;
  completed?: boolean;
  approved?: boolean;
  
  // Conversation and analysis
  transcript?: string;
  research?: string | null;
  faq?: string | null;
  prescription?: string;
  
  // Allow any other properties that might be present
  [key: string]: any;
}

// Type definition for Case document
export interface CaseDocument {
  _id: string | { toString(): string };
  patientId: string | { toString(): string };
  transcript: string;
  patientHistory: string;
  patientInfo: Record<string, any>;
  aiAnalysis: string;
  prescription: {
    content: string;
    doctorId: string | null;
    createdAt: string | Date | null;
  };
  doctorId: string | null;
  doctorName: string;
  doctorComments: string;
  approved: boolean;
  completed: boolean;
  completedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Type definition for Patient document
export interface PatientDocument {
  _id: string | { toString(): string };
  name: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  address: string;
  medicalHistory: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type {
  DoctorDocument,
  MongooseCurrentPatientDocument,
  MongoosePatientDocument,
  CompletedConsultationDocument
};
