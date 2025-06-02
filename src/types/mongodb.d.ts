import { Document, Types } from 'mongoose';
import { IDoctor } from '@/lib/db/models/Doctor';
import { ICurrentPatient } from '@/lib/db/models/CurrentPatient';
import { IPatient } from '@/lib/db/models/Patient';
import { ICompletedConsultation } from '@/lib/db/models/CompletedConsultation';

// Add _id field to all document types
export interface DoctorDocument extends IDoctor, Document {
  _id: Types.ObjectId;
}

export interface CurrentPatientDocument extends ICurrentPatient, Document {
  _id: Types.ObjectId;
  // Additional fields that may come from n8n workflow
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

export interface PatientDocument extends IPatient, Document {
  _id: Types.ObjectId;
}

export interface CompletedConsultationDocument extends ICompletedConsultation, Document {
  _id: Types.ObjectId;
}