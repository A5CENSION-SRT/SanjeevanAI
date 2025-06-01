# Doctor Portal API Documentation

This document provides information about the API endpoints available for integrating the WhatsApp AI medical service with the Doctor Portal.

## Environment Setup

First, make sure to set up the environment variables in a `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/doctor_portal
MONGODB_DB=doctor_portal
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## API Endpoints

### 1. Append Consultation Data

Append new chat messages or images to an existing consultation.

**Endpoint:** `POST /api/consultations/append`

**Request Body:**

```json
{
  "phoneNumber": "+919876543210",
  "chatData": {
    "role": "user",
    "content": "I'm feeling better today"
  },
  "imageData": {
    "url": "https://example.com/medical-image.jpg",
    "description": "X-ray image"
  },
  "consultationId": "optional-consultation-id"
}
```

**Notes:**
- `phoneNumber` is required
- Either `chatData` or `imageData` must be provided
- `consultationId` is optional. If not provided, the most recent consultation will be updated

### 2. Update AI Prescription

Update or create an AI-generated prescription for a consultation.

**Endpoint:** `POST /api/consultations/prescription`

**Request Body:**

```json
{
  "phoneNumber": "+919876543210",
  "prescriptionData": {
    "diagnosis": "Tension Headache",
    "medications": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "As needed",
        "duration": "3 days"
      }
    ],
    "recommendations": [
      "Rest",
      "Hydration",
      "Avoid screen time"
    ]
  },
  "consultationId": "optional-consultation-id"
}
```

**Notes:**
- `phoneNumber` and `prescriptionData` are required
- `consultationId` is optional. If not provided, the most recent consultation will be updated

### 3. Create New Consultation

Create a new consultation for an existing patient.

**Endpoint:** `POST /api/consultations/new`

**Request Body:**

```json
{
  "phoneNumber": "+919876543210",
  "initialMessage": "I have a headache"
}
```

**Notes:**
- Both `phoneNumber` and `initialMessage` are required
- The patient must already exist in the database

### 4. Create New Patient

Create a new patient in the database.

**Endpoint:** `POST /api/patients`

**Request Body:**

```json
{
  "name": "Patient Name",
  "age": 30,
  "gender": "female",
  "phoneNumber": "+919876543210",
  "initialMessage": "I have a headache"
}
```

**Notes:**
- All fields are required
- A new consultation with the `initialMessage` will be created automatically

## MongoDB Schema

### Patient Collection

```typescript
{
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
        doctorId: ObjectId;
        reviewedAt: Date;
        comments: string;
      };
    };
    status: 'pending_review' | 'reviewed' | 'completed';
  }>;
}
```

### CompletedConsultation Collection

```typescript
{
  patientId: ObjectId;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  consultationDate: Date;
  completedDate: Date;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  recommendations: string[];
  doctorId: ObjectId;
  doctorName: string;
  doctorComments: string;
  aiChat: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  images: Array<{
    url: string;
    description: string;
  }>;
}
```

## Usage Examples

### Example: WhatsApp Integration Flow

1. When a new patient messages on WhatsApp:
   ```javascript
   // Create a new patient
   fetch('/api/patients', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: "New Patient",
       age: 30,
       gender: "female",
       phoneNumber: "+919876543210",
       initialMessage: "I have a headache"
     })
   });
   ```

2. When a patient sends a new message:
   ```javascript
   // Append chat message to existing consultation
   fetch('/api/consultations/append', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       phoneNumber: "+919876543210",
       chatData: {
         role: "user",
         content: "The pain is getting worse"
       }
     })
   });
   ```

3. When the AI generates a response:
   ```javascript
   // Append AI response
   fetch('/api/consultations/append', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       phoneNumber: "+919876543210",
       chatData: {
         role: "assistant",
         content: "I understand. How long have you had this pain?"
       }
     })
   });
   ```

4. When the AI generates a prescription:
   ```javascript
   // Update prescription
   fetch('/api/consultations/prescription', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       phoneNumber: "+919876543210",
       prescriptionData: {
         diagnosis: "Tension Headache",
         medications: [
           {
             name: "Paracetamol",
             dosage: "500mg",
             frequency: "As needed",
             duration: "3 days"
           }
         ],
         recommendations: [
           "Rest",
           "Hydration",
           "Avoid screen time"
         ]
       }
     })
   });
   ```

5. After the doctor reviews and approves the prescription, it will be moved to the CompletedConsultation collection automatically. 