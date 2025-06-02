import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
    name: string;
    age: number;
    gender: string;
    phoneNumber: string;
    consultations: Array<{
        date: Date;
        aiChat: Array<{
            role: 'user' | 'assistant';
            content: string;
            timestamp: Date;
        }>;
        images: Array<{
            url: string;
            description: string;
            timestamp: Date;
        }>;
        finalPrescription: {
            diagnosis: string;
            medications: Array<{
                name: string;
                dosage: string;
                frequency: string;
                duration: string;
            }>;
            recommendations: string[];
            generatedAt: Date;
            reviewedBy?: {
                doctorId: Schema.Types.ObjectId;
                reviewedAt: Date;
                comments: string;
            };
        };
        status: 'pending_review' | 'reviewed' | 'completed';
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    consultations: [{
        date: { type: Date, default: Date.now },
        aiChat: [{
            role: { type: String, enum: ['user', 'assistant'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }],
        images: [{
            url: { type: String, required: true },
            description: { type: String },
            timestamp: { type: Date, default: Date.now }
        }],
        finalPrescription: {
            diagnosis: { type: String, required: true },
            medications: [{
                name: { type: String, required: true },
                dosage: { type: String, required: true },
                frequency: { type: String, required: true },
                duration: { type: String, required: true }
            }],
            recommendations: [String],
            generatedAt: { type: Date, default: Date.now },
            reviewedBy: {
                doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
                reviewedAt: Date,
                comments: String
            }
        },
        status: {
            type: String,
            enum: ['pending_review', 'reviewed', 'completed'],
            default: 'pending_review'
        }
    }]
}, {
    timestamps: true
});

export const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema); 