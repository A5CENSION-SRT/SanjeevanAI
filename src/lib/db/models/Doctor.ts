import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDoctor extends Document {
    name: string;
    email: string;
    password: string;
    specialization: string;
    qualification: string;
    phone: string;
    address: string;
    isAdmin: boolean;
    profileImage?: string;
    verifyPassword: (password: string) => Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true },
    qualification: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    profileImage: { type: String },
}, {
    timestamps: true
});

// Hash password before saving
DoctorSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to verify password
DoctorSchema.methods.verifyPassword = async function(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

// Use the 'doctors' collection
export const Doctor = mongoose.models.Doctor || 
    mongoose.model<IDoctor>('Doctor', DoctorSchema, 'doctors'); 