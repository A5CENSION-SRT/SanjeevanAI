import mongoose, { Schema, Document } from 'mongoose';

export interface ICurrentPatient extends Document {
    patientId?: Schema.Types.ObjectId;
    patientName: string;
    patientAge: number;
    patientGender: string;
    patientPhone: string;
    consultationId?: Schema.Types.ObjectId;
    consultationDate: Date;
    lastUpdated: Date;
    status: 'active' | 'in_review';
    aiSummary: string;
    createdAt: Date;
    updatedAt: Date;
}

const CurrentPatientSchema = new Schema<ICurrentPatient>({
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: false },
    patientName: { type: String, required: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, required: true },
    patientPhone: { type: String, required: true },
    consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation', required: false },
    consultationDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['active', 'in_review'], 
        default: 'active' 
    },
    aiSummary: { type: String, default: '' },
}, {
    timestamps: true
});

CurrentPatientSchema.index({ consultationId: 1 }, { unique: true });

export const CurrentPatient = mongoose.models.CurrentPatient || 
    mongoose.model<ICurrentPatient>('CurrentPatient', CurrentPatientSchema, 'currentpatients'); 