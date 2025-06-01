const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide patient name'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Please provide age']
    },
    gender: {
        type: String,
        required: [true, 'Please provide gender'],
        enum: ['Male', 'Female', 'Other']
    },
    contact: {
        type: String,
        required: [true, 'Please provide contact number']
    },
    email: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    address: {
        type: String
    },
    medicalHistory: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);