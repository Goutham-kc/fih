import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

async function wipeLive() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in .env.local');
    process.exit(1);
  }
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected!');

  const db = mongoose.connection.db;
  const collections = ['todos', 'debts', 'deadlines', 'importantdates', 'watchlistitems', 'reminders', 'pendingintents'];
  const liveQuery = { $or: [{ environmentMode: 'live' }, { environmentMode: { $exists: false } }] };

  for (const colName of collections) {
    try {
      const col = db.collection(colName);
      const res = await col.deleteMany(liveQuery);
      console.log(`Wiped ${res.deletedCount} live items from collection: ${colName}`);
    } catch (err) {
      console.log(`Collection ${colName} error or empty:`, err.message);
    }
  }

  console.log('\n✅ Live Database Wipe Complete!');
  process.exit(0);
}

wipeLive().catch(err => {
  console.error('Wipe failed:', err);
  process.exit(1);
});
