# MongoDB Database Setup Guide

## Setup Instructions

1. **Create a `.env` file** in the root directory with the following content:

   ```
   # MongoDB Configuration
   MONGO_URI=mongodb+srv://<db_username>:<db_password>@sanjeeviniai.eq040vd.mongodb.net/?retryWrites=true&w=majority&appName=SanjeeviniAI

   # Application Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   MONGODB_DB=doctor_portal
   ```

2. **Replace the placeholders** in the MongoDB URI:

   - Replace `<db_username>` with your actual MongoDB Atlas username
   - Replace `<db_password>` with your actual MongoDB Atlas password

3. **Update the database setup script**:
   Open `scripts/setup-database.js` and update the username and password with your actual MongoDB Atlas credentials.

4. **Run the database setup script**:
   ```
   npm run setup-db
   ```

## Database Structure

The application uses the following collections:

1. **doctors** - Stores information about medical professionals
2. **patients** - Stores patient information
3. **appointments** - Tracks appointments between doctors and patients
4. **medical_records** - Stores medical records and treatment information

## Models

The application uses Mongoose models to interact with the MongoDB collections:

- **Doctor.js** - Defines the schema for doctor data
- **Patient.js** - Defines the schema for patient data
- **Appointment.js** - Defines the schema for appointment data
- **MedicalRecord.js** - Defines the schema for medical records

## Connection

The application connects to MongoDB using the connection string specified in the `.env` file. The connection is established in `db.js`.

## Troubleshooting

If you encounter connection issues:

1. Verify your MongoDB Atlas username and password are correct
2. Check that your IP address is whitelisted in MongoDB Atlas
3. Ensure the cluster name in the connection string is correct
4. Check MongoDB Atlas console for any service disruptions
