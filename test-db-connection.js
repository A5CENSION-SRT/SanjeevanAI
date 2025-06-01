// test-db-connection.js
const { MongoClient } = require('mongodb');

// MongoDB Atlas credentials
const username = "sanjiviniapp";
const password = "Raghottam";
const clusterUrl = "sanjeeviniai.eq040vd.mongodb.net";
const connectionString = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=SanjeeviniAI`;

console.log("Connection string being used (with new credentials)");

async function testConnection() {
    console.log("Testing MongoDB connection...");

    try {
        const client = new MongoClient(connectionString);
        await client.connect();
        console.log("✅ Successfully connected to MongoDB Atlas!");

        // List available databases
        const databasesList = await client.db().admin().listDatabases();
        console.log("Databases available:");
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));

        await client.close();
        console.log("Connection closed.");

    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);

        if (error.code === 8000 || error.message.includes("Authentication failed")) {
            console.log("\nAuthentication failed. Please check:");
            console.log("1. Make sure the username and password are correct");
            console.log("2. Ensure your IP address is whitelisted in MongoDB Atlas");
            console.log("3. Check if the cluster URL is correct");
        }
    }
}

testConnection();