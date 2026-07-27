import mongoose, { Schema } from 'mongoose';

const DeadlineSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  dueDate: { type: Date, required: true },
  category: { type: String, enum: ['academic', 'internship', 'personal'], default: 'personal' },
  reminderOffsets: { type: [Number], default: [1440, 60] }, // minutes before dueDate
  remindersSent: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Deadline || mongoose.model('Deadline', DeadlineSchema);
