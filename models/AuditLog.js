import mongoose, { Schema } from 'mongoose';

const AuditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true }, // e.g. 'CREATE', 'UPDATE', 'DELETE', 'REMINDER_SENT', 'SYSTEM'
  module: { type: String, required: true }, // e.g. 'todo', 'debt', 'deadline', 'date', 'watch', 'reminder', 'system'
  description: { type: String, required: true },
  environmentMode: { type: String, enum: ['live', 'development'], default: 'live', index: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
