const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const cleanIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB Connected...');

        const db = mongoose.connection.db;
        
        // 1. Fix Clients Collection
        const clientCollection = db.collection('clients');
        const clientIndexes = await clientCollection.indexes();
        
        console.log('\n--- Checking Client Indexes ---');
        for (const index of clientIndexes) {
            // Check for the known problematic index 'publicKey_1' or any other unused unique indexes
            if (index.name === 'publicKey_1') {
                console.log(`Dropping problematic index: ${index.name}`);
                await clientCollection.dropIndex(index.name);
                console.log('Index dropped successfully.');
            } else {
                console.log(`Keeping index: ${index.name}`);
            }
        }

        // 2. Fix Admins Collection (just in case)
        const adminCollection = db.collection('admins'); // Collection name is usually pluralized lower-case of model name
        const adminIndexes = await adminCollection.indexes();
        
        console.log('\n--- Checking Admin Indexes ---');
        for (const index of adminIndexes) {
            if (index.name === 'publicKey_1') {
                console.log(`Dropping problematic index: ${index.name}`);
                await adminCollection.dropIndex(index.name);
                console.log('Index dropped successfully.');
            } else {
                console.log(`Keeping index: ${index.name}`);
            }
        }

        console.log('\nDatabase cleanup complete.');
        process.exit();

    } catch (error) {
        console.error('Error cleaning indexes:', error);
        process.exit(1);
    }
};

cleanIndexes();
