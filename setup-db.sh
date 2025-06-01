#!/bin/bash

# Doctor Portal Database Setup Script

echo "Setting up Doctor Portal database..."

# Check if .env file exists, if not create it from example
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp env.example .env
  echo ".env file created. Please check and update the MongoDB connection details if needed."
else
  echo ".env file already exists."
fi

# Install dependencies for the initialization script
echo "Installing script dependencies..."
cd scripts
npm install

# Run the initialization script
echo "Initializing database with sample data..."
npm run init

echo "Database setup complete!"
echo "You can now start the Doctor Portal application." 