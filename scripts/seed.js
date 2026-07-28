import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI missing in .env.local');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  whatsappNumber: { type: String, required: true, unique: true },
  environmentMode: { type: String, enum: ['live', 'development'], default: 'live' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  const email = process.argv[2] || process.env.SEED_EMAIL || 'admin@example.com';
  const password = process.argv[3] || process.env.SEED_PASSWORD || 'password123';
  const whatsappNumber = process.argv[4] || process.env.SEED_PHONE || '+919000000000';

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGODB_URI);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`User already exists for ${email}. Updating password & phone...`);
    existing.passwordHash = await bcrypt.hash(password, 12);
    existing.whatsappNumber = whatsappNumber;
    await existing.save();
    console.log(`Successfully updated user: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email: email.toLowerCase(), passwordHash, whatsappNumber });
    console.log(`Successfully created user: ${email}`);
  }

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
