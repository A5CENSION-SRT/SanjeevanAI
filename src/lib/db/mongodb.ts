import mongoose from 'mongoose';

// Use the connection string that we know works
const username = "sanjiviniapp";
const password = "Raghottam";
const clusterUrl = "sanjeeviniai.eq040vd.mongodb.net";
const dbName = "doctor_portal";
const connectionString = `mongodb+srv://${username}:${password}@${clusterUrl}/${dbName}?retryWrites=true&w=majority&appName=SanjeeviniAI`;

// For debugging
console.log('Attempting to connect to MongoDB with connection string:', 
  connectionString.replace(password, '********'));

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(connectionString, opts)
            .then((mongoose) => {
                console.log('MongoDB connected successfully');
                return mongoose;
            })
            .catch(err => {
                console.error('MongoDB connection error:', err);
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectToDatabase; 