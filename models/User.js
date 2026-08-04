import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  whatsappNumber: { type: String, required: true, unique: true },
  environmentMode: { type: String, enum: ['live', 'development'], default: 'live' },
  modeSwitchToken: { type: String },
  modeSwitchExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
