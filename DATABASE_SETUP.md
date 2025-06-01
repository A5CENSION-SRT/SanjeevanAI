# Doctor Portal Database Setup Guide

This guide provides detailed instructions for setting up the MongoDB database for the Doctor Portal application.

## Prerequisites

- MongoDB (local installation or MongoDB Atlas account)
- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Options

### Option 1: Automated Setup (Recommended)

1. Create a `.env` file in the root directory by copying the example:
   ```
   cp env.example .env
   ```

2. Edit the `.env` file with your MongoDB connection details:
   ```
   MONGODB_URI=mongodb://localhost:27017/doctor_portal
   MONGODB_DB=doctor_portal
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. Run the setup script:
   ```
   ./setup-db.sh
   ```

### Option 2: Manual Setup

1. Create a `.env` file in the root directory with your MongoDB connection details:
   ```
   MONGODB_URI=mongodb://localhost:27017/doctor_portal
   MONGODB_DB=doctor_portal
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

2. Install dependencies for the script:
   ```
   cd scripts
   npm install
   ```

3. Run the initialization script:
   ```
   npm run init
   ```

## MongoDB Configuration Options

### Local MongoDB

For a local MongoDB installation, use:
```
MONGODB_URI=mongodb://localhost:27017/doctor_portal
```

### MongoDB Atlas

For MongoDB Atlas, use the connection string provided by Atlas:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, `<cluster-url>`, and `<database>` with your MongoDB Atlas credentials.

## Verifying the Setup

After setting up the database, you can verify that everything is working correctly:

1. Start the Next.js application:
   ```
   npm run dev
   ```

2. Visit the health check endpoint:
   ```
   http://localhost:3000/api/health
   ```
   You should see a JSON response with `"status": "ok"` and `"database": "connected"`.

3. Check the patients endpoint to verify sample data:
   ```
   http://localhost:3000/api/patients
   ```
   You should see a JSON array with the sample patients.

## Sample Data

The initialization script creates:

- 3 patients with pending consultations
- 2 completed consultations

This allows you to test all features of the Doctor Portal frontend, including:
- Viewing pending prescriptions
- Reviewing patient conversations
- Viewing completed consultations
- Testing the approval workflow

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check that MongoDB is running
2. Verify your connection string in the `.env` file
3. Check for network issues or firewall settings

### Data Not Appearing

If the sample data doesn't appear:

1. Check the console output from the initialization script for errors
2. Verify that the collections were created in your MongoDB database
3. Try running the initialization script again

### Other Issues

For other issues, check the MongoDB logs and the initialization script output for error messages. 