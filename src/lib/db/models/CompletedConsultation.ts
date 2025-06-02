import mongoose, { Schema, Document } from 'mongoose';

export interface ICompletedConsultation extends Document {
    patientId?: Schema.Types.ObjectId;
    patientName: string;
    patientAge: number;
    patientGender: string;
    patientPhone: string;
    consultationDate: Date;
    completedDate: Date;
    diagnosis: string;
    medications: Array<{
        name: string;
        dosage?: string;
        frequency?: string;
        duration?: string;
    }>;
    recommendations: string[];
    doctorId: Schema.Types.ObjectId;
    doctorName: string;
    doctorComments?: string;
    aiChat: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp?: Date;
    }>;
    images?: Array<{
        url: string;
        description?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const CompletedConsultationSchema = new Schema<ICompletedConsultation>({
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: false },
    patientName: { type: String, required: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, required: true },
    patientPhone: { type: String, required: true },
    consultationDate: { type: Date, default: Date.now },
    completedDate: { type: Date, default: Date.now },
    diagnosis: { type: String, default: 'Not specified' },
    medications: [{
        name: { type: String, required: true },
        dosage: { type: String, default: '' },
        frequency: { type: String, default: '' },
        duration: { type: String, default: '' }
    }],
    recommendations: [String],
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorName: { type: String, required: true },
    doctorComments: { type: String, default: '' },
    aiChat: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    images: [{
        url: { type: String, required: true },
        description: { type: String, default: '' }
    }]
}, {
    timestamps: true
});

export const CompletedConsultation = mongoose.models.CompletedConsultation ||
    mongoose.model<ICompletedConsultation>('CompletedConsultation', CompletedConsultationSchema, 'completedconsultations'); 