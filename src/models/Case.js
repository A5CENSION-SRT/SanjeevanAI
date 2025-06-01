const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient ID is required']
    },
    transcript: {
        type: String,
        required: [true, 'AI-Patient conversation transcript is required']
    },
    patientHistory: {
        type: String,
        default: ''
    },
    patientInfo: {
        type: Object,
        default: {}
    },
    aiAnalysis: {
        type: String,
        default: ''
    },
    prescription: {
        content: {
            type: String,
            default: ''
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            default: null
        },
        createdAt: {
            type: Date,
            default: null
        }
    },
    // Doctor information
    doctorId: {
        type: String,
        default: null
    },
    doctorName: {
        type: String,
        default: ''
    },
    doctorComments: {
        type: String,
        default: ''
    },
    // Status fields
    approved: {
        type: Boolean,
        default: false
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Case || mongoose.model('Case', CaseSchema);
