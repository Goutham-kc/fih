import mongoose, { Schema } from 'mongoose';

const DeadlineSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  dueDate: { type: Date, required: true },
  category: { type: String, enum: ['academic', 'personal'], default: 'personal' },
  reminderOffsets: { type: [Number], default: [2880, 1440, 60] },
  remindersSent: { type: [Number], default: [] },
  environmentMode: { type: String, enum: ['live', 'development'], default: 'live', index: true },
  createdAt: { type: Date, default: Date.now },
});

DeadlineSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('dueDate') || this.isModified('reminderOffsets')) {
    const now = new Date();
    this.reminderOffsets = this.reminderOffsets.filter(offset => {
      const reminderTime = new Date(this.dueDate.getTime() - offset * 60 * 1000);
      return reminderTime > now;
    });
  }
  next();
});

export default mongoose.models.Deadline || mongoose.model('Deadline', DeadlineSchema);
