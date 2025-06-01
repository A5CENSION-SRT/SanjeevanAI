# SanjeevanAI - Doctor Portal

This is a Next.js application for the SanjeevanAI Doctor Portal, enabling doctors to review AI-assisted patient consultations, manage prescriptions, and track patient interactions. The backend is powered by MongoDB.

## Features

- **Doctor Login**: Secure portal access for doctors.
- **Current Patient Dashboard**: View patients with active consultations requiring review.
- **Consultation Review**: Access patient chat history (from WhatsApp integration) and images.
- **Prescription Management**: Review AI-generated prescriptions, modify, and approve them.
- **Consultation Completion**: Mark consultations as complete, moving them to a historical record.
- **API for WhatsApp Agent**: Endpoints for the backend team to integrate the WhatsApp AI agent (create patients, append messages/images, update prescriptions).

## Project Structure

```
/SanjeevanAI
├── src/
│   ├── app/                # Next.js app directory (UI pages and API routes)
│   │   ├── api/            # API routes (e.g., /api/patients, /api/consultations)
│   │   ├── dashboard/      # Doctor dashboard pages
│   │   ├── layout.tsx      # Main layout
│   │   └── page.tsx        # Homepage (Login)
│   ├── lib/
│   │   ├── db/
│   │   │   ├── models/     # Mongoose models (Patient.ts, Doctor.ts, etc.)
│   │   │   ├── utils/      # Database utility functions
│   │   │   └── mongodb.ts  # MongoDB connection setup
│   │   └── ...
│   ├── components/         # Reusable React components (if any)
│   ├── styles/             # Global styles
│   └── types/              # TypeScript type definitions (mongodb.d.ts, global.d.ts)
├── public/                 # Static assets (images, etc.)
├── scripts/
│   └── seed-db.js          # Script to seed database with sample data
├── .env.example            # Example environment variables
├── BACKEND_API_GUIDE.md    # Documentation for backend utility functions
├── API_DOCUMENTATION.md    # Detailed API endpoint documentation
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- MongoDB (local installation or a MongoDB Atlas account)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository_url>
cd SanjeevanAI
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp env.example .env
```

Edit the `.env` file with your MongoDB connection details:

```
# MongoDB Configuration
# Example for local MongoDB:
MONGODB_URI=mongodb://localhost:27017/sanjeevan_ai
# Example for MongoDB Atlas (replace with your actual connection string):
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/sanjeevan_ai?retryWrites=true&w=majority
MONGODB_DB=sanjeevan_ai

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Important:**
- Replace `MONGODB_URI` with your actual MongoDB connection string.
- Ensure the database name (`sanjeevan_ai` or your choice) is consistent in `MONGODB_URI` and `MONGODB_DB`.

### 4. Seed the Database (Optional, but Recommended for First Run)

This script will create a sample doctor, sample patients, and add some patients to the "current consultations" queue so you can test the dashboard immediately.

```bash
npm run seed
```

**Note:** The seed script is designed to be run multiple times. It will only create sample data if it doesn't already exist.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

### 6. Accessing the Doctor Portal

- Go to [http://localhost:3000](http://localhost:3000).
- Use the following credentials to log in (as created by the seed script):
    - **Email**: `doctor@example.com`
    - **Password**: `password`

After successful login, you will be redirected to the Doctor Dashboard at `/dashboard`.

## API Endpoints for Backend Team

Detailed API endpoint documentation can be found in `API_DOCUMENTATION.md`.
Utility functions for direct database interaction (e.g., for the WhatsApp agent) are documented in `BACKEND_API_GUIDE.md`.

Here's a summary of key API endpoints your backend team will use:

- **Create New Patient (and first consultation)**:
    - `POST /api/patients`
    - Body: `{ "name", "age", "gender", "phoneNumber", "initialMessage" }`
- **Append Chat Message or Image to Consultation**:
    - `POST /api/consultations/append`
    - Body: `{ "phoneNumber", "chatData"?: { "role", "content" }, "imageData"?: { "url", "description" }, "consultationId"?: "string" }`
- **Update AI-Generated Prescription**:
    - `POST /api/consultations/prescription`
    - Body: `{ "phoneNumber", "prescriptionData": { "diagnosis", "medications": [], "recommendations": [] }, "consultationId"?: "string" }`

## Building for Production

```bash
npm run build
npm run start
```

## Linting

```bash
npm run lint
```

## Key Files & Functionality

- **Doctor Login**: `src/app/page.tsx`
- **Doctor Dashboard (Current Patients)**: `src/app/dashboard/page.tsx`
- **API for Current Patients**: `src/app/api/consultations/current/route.ts`
- **API for Completing Consultation**: `src/app/api/consultations/complete/route.ts`
- **MongoDB Models**: `src/lib/db/models/`
- **Database Utilities**: `src/lib/db/utils/`
    - `patientUtils.ts`: For creating patients, appending messages/images, updating prescriptions.
    - `currentPatientUtils.ts`: For managing the doctor's active consultation queue.

## Notes on MongoDB Schemas

- **`Patient`**: Main collection storing all patient data and their complete consultation history.
- **`CurrentPatient`**: A lean collection used to quickly fetch active consultations for the doctor's dashboard. It references `Patient` and a specific `consultationId` from the `Patient`'s `consultations` array.
- **`CompletedConsultation`**: Stores a denormalized snapshot of a consultation once a doctor marks it as complete. This is useful for historical records and analytics without needing to join data from `Patient` all the time.
- **`Doctor`**: Stores doctor information.

When a consultation is completed via the UI:
1. A new document is created in `CompletedConsultation`.
2. The corresponding consultation in the `Patient` document has its status updated to `'completed'`.
3. The entry in the `CurrentPatient` table is deleted (as it's no longer "current").

This setup ensures that the doctor's dashboard (`CurrentPatient`) is always fast and shows only relevant, active cases, while historical data is preserved efficiently.
