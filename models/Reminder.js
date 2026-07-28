import mongoose, { Schema } from 'mongoose';

const ReminderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  remindAt: { type: Date, required: true, index: true },
  sent: { type: Boolean, default: false },
  sentAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);
