import mongoose, { Schema } from 'mongoose';

const PresenceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  characterId: { type: String, default: 'celine' },
  x: { type: Number, default: 1324 },
  y: { type: Number, default: 2133 },
  dir: { type: Number, default: 0 },
  walking: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
});

// Auto-expire documents after 60 seconds of inactivity
PresenceSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 60 });

export default mongoose.models.Presence || mongoose.model('Presence', PresenceSchema);
