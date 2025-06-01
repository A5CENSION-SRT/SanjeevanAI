import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// Get MongoDB URI from environment variables
const uri = process.env.MONGO_URI;

export default async function handler(req, res) {
    try {
        // Test connection using MongoClient
        const client = new MongoClient(uri);
        await client.connect();

        // Get a list of databases
        const admin = client.db().admin();
        const databasesList = await admin.listDatabases();

        // Get doctor_portal database
        const db = client.db('doctor_portal');

        // Get a list of collections in the doctor_portal database
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        // Count documents in doctors collection
        const doctorsCount = await db.collection('doctors').countDocuments();

        // Get a sample doctor
        const sampleDoctor = await db.collection('doctors').findOne({});

        await client.close();

        return res.status(200).json({
            success: true,
            message: 'Database connection successful',
            data: {
                databases: databasesList.databases.map(db => db.name),
                collections: collectionNames,
                doctorsCount,
                sampleDoctor
            }
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
}