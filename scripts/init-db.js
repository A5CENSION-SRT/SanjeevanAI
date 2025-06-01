require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Define schemas
const PatientSchema = new mongoose.Schema({
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
      diagnosis: { type: String, default: '' },
      medications: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true }
      }],
      recommendations: [String],
      generatedAt: { type: Date, default: Date.now },
      reviewedBy: {
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
        reviewedAt: { type: Date },
        comments: { type: String }
      }
    },
    status: { type: String, enum: ['pending_review', 'reviewed', 'completed'], default: 'pending_review' }
  }]
}, { timestamps: true });

const CompletedConsultationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  patientGender: { type: String, required: true },
  patientPhone: { type: String, required: true },
  consultationDate: { type: Date, required: true },
  completedDate: { type: Date, default: Date.now },
  diagnosis: { type: String, required: true },
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true }
  }],
  recommendations: [String],
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  doctorComments: { type: String },
  aiChat: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date }
  }],
  images: [{
    url: { type: String, required: true },
    description: { type: String }
  }]
}, { timestamps: true });

// Create models
const Patient = mongoose.model('Patient', PatientSchema);
const CompletedConsultation = mongoose.model('CompletedConsultation', CompletedConsultationSchema);

// Sample data
const samplePatients = [
  {
    name: 'John Doe',
    age: 35,
    gender: 'male',
    phoneNumber: '+919876543210',
    consultations: [
      {
        date: new Date('2023-05-15T10:30:00'),
        aiChat: [
          {
            role: 'user',
            content: 'I have been experiencing severe headaches for the past 3 days.',
            timestamp: new Date('2023-05-15T10:30:00')
          },
          {
            role: 'assistant',
            content: 'I understand that can be concerning. Can you describe the pain? Is it on one side or both sides of your head?',
            timestamp: new Date('2023-05-15T10:31:00')
          },
          {
            role: 'user',
            content: 'It\'s mostly on the right side and feels like throbbing.',
            timestamp: new Date('2023-05-15T10:32:00')
          },
          {
            role: 'assistant',
            content: 'Thank you for that information. Have you noticed any triggers like stress, lack of sleep, or certain foods?',
            timestamp: new Date('2023-05-15T10:33:00')
          },
          {
            role: 'user',
            content: 'I\'ve been working late and not sleeping well.',
            timestamp: new Date('2023-05-15T10:34:00')
          }
        ],
        images: [],
        finalPrescription: {
          diagnosis: 'Tension Headache',
          medications: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '3 days'
            },
            {
              name: 'Ibuprofen',
              dosage: '400mg',
              frequency: 'As needed',
              duration: '3 days'
            }
          ],
          recommendations: [
            'Ensure adequate sleep (7-8 hours)',
            'Take short breaks during work',
            'Stay hydrated',
            'Apply cold compress to forehead if needed'
          ],
          generatedAt: new Date('2023-05-15T10:40:00')
        },
        status: 'pending_review'
      }
    ]
  },
  {
    name: 'Jane Smith',
    age: 28,
    gender: 'female',
    phoneNumber: '+919876543211',
    consultations: [
      {
        date: new Date('2023-05-14T14:20:00'),
        aiChat: [
          {
            role: 'user',
            content: 'I have a sore throat and slight fever since yesterday.',
            timestamp: new Date('2023-05-14T14:20:00')
          },
          {
            role: 'assistant',
            content: 'I\'m sorry to hear that. What is your temperature, if you\'ve measured it?',
            timestamp: new Date('2023-05-14T14:21:00')
          },
          {
            role: 'user',
            content: 'It\'s 99.5°F (37.5°C)',
            timestamp: new Date('2023-05-14T14:22:00')
          },
          {
            role: 'assistant',
            content: 'That\'s a low-grade fever. Do you have any other symptoms like cough or runny nose?',
            timestamp: new Date('2023-05-14T14:23:00')
          },
          {
            role: 'user',
            content: 'Yes, I have a mild cough and feel tired.',
            timestamp: new Date('2023-05-14T14:24:00')
          }
        ],
        images: [],
        finalPrescription: {
          diagnosis: 'Viral Pharyngitis',
          medications: [
            {
              name: 'Paracetamol',
              dosage: '650mg',
              frequency: 'Every 6 hours as needed',
              duration: '5 days'
            },
            {
              name: 'Throat Lozenges',
              dosage: '1 lozenge',
              frequency: 'Every 3-4 hours',
              duration: '3 days'
            }
          ],
          recommendations: [
            'Rest adequately',
            'Drink warm fluids',
            'Gargle with warm salt water',
            'Avoid cold beverages'
          ],
          generatedAt: new Date('2023-05-14T14:30:00')
        },
        status: 'pending_review'
      }
    ]
  },
  {
    name: 'Robert Johnson',
    age: 42,
    gender: 'male',
    phoneNumber: '+919876543212',
    consultations: [
      {
        date: new Date('2023-05-13T09:15:00'),
        aiChat: [
          {
            role: 'user',
            content: 'I\'ve been having stomach pain after meals for about a week.',
            timestamp: new Date('2023-05-13T09:15:00')
          },
          {
            role: 'assistant',
            content: 'I understand that must be uncomfortable. Can you describe where exactly the pain is located?',
            timestamp: new Date('2023-05-13T09:16:00')
          },
          {
            role: 'user',
            content: 'It\'s in the upper part of my stomach, just below my chest.',
            timestamp: new Date('2023-05-13T09:17:00')
          }
        ],
        images: [],
        finalPrescription: {
          diagnosis: 'Gastritis',
          medications: [
            {
              name: 'Pantoprazole',
              dosage: '40mg',
              frequency: 'Once daily before breakfast',
              duration: '7 days'
            },
            {
              name: 'Antacid Suspension',
              dosage: '10ml',
              frequency: 'After meals and at bedtime',
              duration: '7 days'
            }
          ],
          recommendations: [
            'Avoid spicy and oily foods',
            'Eat smaller, more frequent meals',
            'Avoid alcohol and smoking',
            'Don\'t lie down immediately after eating'
          ],
          generatedAt: new Date('2023-05-13T09:25:00')
        },
        status: 'pending_review'
      }
    ]
  }
];

const sampleCompletedConsultations = [
  {
    patientId: null, // Will be set after patient creation
    patientName: 'Maria Garcia',
    patientAge: 45,
    patientGender: 'female',
    patientPhone: '+919876543213',
    consultationDate: new Date('2023-05-10T11:00:00'),
    completedDate: new Date('2023-05-10T11:30:00'),
    diagnosis: 'Seasonal Allergic Rhinitis',
    medications: [
      {
        name: 'Cetirizine',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '14 days'
      },
      {
        name: 'Fluticasone Nasal Spray',
        dosage: '1 spray in each nostril',
        frequency: 'Twice daily',
        duration: '14 days'
      }
    ],
    recommendations: [
      'Avoid known allergens',
      'Use air purifier indoors',
      'Keep windows closed during high pollen days',
      'Rinse sinuses with saline solution if needed'
    ],
    doctorId: new ObjectId(),
    doctorName: 'Dr. John Smith',
    doctorComments: 'Patient has history of seasonal allergies. Recommend follow-up in two weeks if symptoms persist.',
    aiChat: [
      {
        role: 'user',
        content: 'I\'ve been sneezing a lot and my eyes are itchy.',
        timestamp: new Date('2023-05-10T11:00:00')
      },
      {
        role: 'assistant',
        content: 'I\'m sorry to hear that. How long have you been experiencing these symptoms?',
        timestamp: new Date('2023-05-10T11:01:00')
      },
      {
        role: 'user',
        content: 'For about a week now. It gets worse when I go outside.',
        timestamp: new Date('2023-05-10T11:02:00')
      }
    ],
    images: []
  },
  {
    patientId: null, // Will be set after patient creation
    patientName: 'William Chen',
    patientAge: 32,
    patientGender: 'male',
    patientPhone: '+919876543214',
    consultationDate: new Date('2023-05-08T15:45:00'),
    completedDate: new Date('2023-05-08T16:15:00'),
    diagnosis: 'Acute Bacterial Sinusitis',
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days'
      },
      {
        name: 'Pseudoephedrine',
        dosage: '60mg',
        frequency: 'Every 12 hours',
        duration: '5 days'
      }
    ],
    recommendations: [
      'Complete full course of antibiotics',
      'Use steam inhalation',
      'Stay hydrated',
      'Follow up if symptoms worsen or don\'t improve in 3 days'
    ],
    doctorId: new ObjectId(),
    doctorName: 'Dr. Sarah Johnson',
    doctorComments: 'Patient has thick nasal discharge and facial pain. Antibiotics prescribed due to suspected bacterial infection.',
    aiChat: [
      {
        role: 'user',
        content: 'I have thick green mucus and pain around my cheeks and eyes.',
        timestamp: new Date('2023-05-08T15:45:00')
      },
      {
        role: 'assistant',
        content: 'That sounds uncomfortable. How long have you had these symptoms?',
        timestamp: new Date('2023-05-08T15:46:00')
      },
      {
        role: 'user',
        content: 'About 10 days now, and it\'s getting worse instead of better.',
        timestamp: new Date('2023-05-08T15:47:00')
      }
    ],
    images: []
  }
];

// Initialize database
async function initializeDatabase() {
  const db = await connectToDatabase();
  
  try {
    // Clear existing data
    await Patient.deleteMany({});
    await CompletedConsultation.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert sample patients
    const patients = await Patient.insertMany(samplePatients);
    console.log(`Inserted ${patients.length} patients`);
    
    // Set patient IDs for completed consultations
    sampleCompletedConsultations[0].patientId = patients[0]._id;
    sampleCompletedConsultations[1].patientId = patients[1]._id;
    
    // Insert completed consultations
    const completedConsultations = await CompletedConsultation.insertMany(sampleCompletedConsultations);
    console.log(`Inserted ${completedConsultations.length} completed consultations`);
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the initialization
initializeDatabase(); 