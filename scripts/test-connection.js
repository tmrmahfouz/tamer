const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.trim().startsWith('#')) {
    process.env[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
  }
});

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

console.log('Testing MongoDB Atlas connection...');
console.log('Cluster: cluster0.mkx5aiq.mongodb.net');
console.log('Database: tamer-platform');
console.log('');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
})
.then(async () => {
  console.log('SUCCESS: Connected to MongoDB Atlas!');
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('');
  console.log('Database Info:');
  console.log('  Database: ' + db.databaseName);
  console.log('  Collections: ' + collections.length);
  if (collections.length > 0) {
    collections.forEach(c => console.log('    - ' + c.name));
  } else {
    console.log('  (No collections yet - will be created when you seed data)');
  }
  
  await mongoose.disconnect();
  console.log('');
  console.log('Connection test passed! Database is ready.');
  process.exit(0);
})
.catch((error) => {
  console.error('FAILED: ' + error.message);
  console.log('');
  console.log('Troubleshooting:');
  console.log('  1. Check if IP Access is set to 0.0.0.0/0 in MongoDB Atlas');
  console.log('  2. Verify username and password are correct');
  console.log('  3. Make sure the cluster is active (not paused)');
  process.exit(1);
});
