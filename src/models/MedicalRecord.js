const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    diagnosis: {
        type: String,
        required: [true, 'Please provide diagnosis']
    },
    symptoms: {
        type: [String],
        required: [true, 'Please provide symptoms']
    },
    treatment: {
        type: String,
        required: [true, 'Please provide treatment plan']
    },
    prescriptions: [{
        medication: String,
        dosage: String,
        frequency: String,
        duration: String
    }],
    followUpDate: {
        type: Date
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);