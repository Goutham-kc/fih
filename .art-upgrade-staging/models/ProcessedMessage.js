import mongoose, { Schema } from 'mongoose';

const ProcessedMessageSchema = new Schema({
  messageId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // 24 hour TTL
});

export default mongoose.models.ProcessedMessage || mongoose.model('ProcessedMessage', ProcessedMessageSchema);
