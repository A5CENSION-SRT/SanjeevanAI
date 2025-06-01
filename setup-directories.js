const fs = require('fs');
const path = require('path');

// Directories to ensure exist
const directories = [
    path.join(process.cwd(), 'public', 'uploads')
];

// Create directories if they don't exist
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
    } else {
        console.log(`Directory already exists: ${dir}`);
    }
});

console.log('Directory setup complete!');