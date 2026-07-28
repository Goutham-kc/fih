import mongoose, { Schema } from 'mongoose';

const DebtSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  person: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'INR' },
  direction: { type: String, enum: ['i_owe', 'owed_to_me'], required: true },
  note: { type: String, default: '' },
  settled: { type: Boolean, default: false },
  settledDate: { type: Date, default: null },
  environmentMode: { type: String, enum: ['live', 'development'], default: 'live', index: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Debt || mongoose.model('Debt', DebtSchema);
