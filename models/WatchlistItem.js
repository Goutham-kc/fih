import mongoose, { Schema } from 'mongoose';

const WatchlistItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['movie', 'show', 'anime', 'book', 'paper'], default: 'show' },
  status: { type: String, enum: ['planned', 'in_progress', 'done'], default: 'planned' },
  rating: { type: Number, min: 1, max: 10, default: null },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.WatchlistItem || mongoose.model('WatchlistItem', WatchlistItemSchema);
