# Doctor Portal Database Setup

This directory contains scripts to set up and initialize the MongoDB database for the Doctor Portal application.

## Prerequisites

- MongoDB installed locally or a MongoDB Atlas account
- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Create a `.env` file in the root directory of the project (doctor-portal/) by copying the example:
   ```
   cp env.example .env
   ```

2. Edit the `.env` file with your MongoDB connection details:
   ```
   MONGODB_URI=mongodb://localhost:27017/doctor_portal
   MONGODB_DB=doctor_portal
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

   If you're using MongoDB Atlas, your connection string will look like:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
   ```

3. Install dependencies for the script:
   ```
   cd scripts
   npm install
   ```

4. Run the initialization script:
   ```
   npm run init
   ```

## What the Script Does

The initialization script:

1. Connects to your MongoDB database
2. Creates the necessary collections (Patient and CompletedConsultation)
3. Populates the collections with sample data for testing
4. Sets up relationships between the collections

## Sample Data

The script creates:
- 3 patients with pending consultations
- 2 completed consultations

This sample data allows you to test all features of the Doctor Portal frontend, including:
- Viewing pending prescriptions
- Reviewing patient conversations
- Viewing completed consultations
- Testing the approval workflow 