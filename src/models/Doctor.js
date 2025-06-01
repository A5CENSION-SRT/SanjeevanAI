const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide doctor name'],
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'Please provide specialization'],
        trim: true
    },
    experience: {
        type: Number,
        required: [true, 'Please provide years of experience']
    },
    email: {
        type: String,
        required: [true, 'Please provide email address'],
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number']
    },
    availability: {
        days: [String],
        hours: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);