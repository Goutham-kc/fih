import mongoose, { Schema } from 'mongoose';

const PendingIntentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  module: { type: String, required: true },
  partialData: { type: Schema.Types.Mixed, default: {} },
  missingField: { type: String, required: true },
  question: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export default mongoose.models.PendingIntent || mongoose.model('PendingIntent', PendingIntentSchema);
