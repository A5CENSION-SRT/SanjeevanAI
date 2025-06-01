// server.js
require('dotenv').config();
const express = require('express');
const app = express();

require('./db'); // imports and runs the MongoDB connection

app.use(express.json()); // for parsing JSON in POST requests

// Later you’ll plug in routes here like:
// const testDataRoutes = require('./routes/testData');
// app.use('/api', testDataRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});
