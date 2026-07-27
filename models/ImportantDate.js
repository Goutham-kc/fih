import mongoose, { Schema } from 'mongoose';

const ImportantDateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  date: { type: String, required: true }, // 'MM-DD' or 'YYYY-MM-DD'
  recurring: { type: String, enum: ['yearly', 'monthly', 'none'], default: 'none' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ImportantDate || mongoose.model('ImportantDate', ImportantDateSchema);
