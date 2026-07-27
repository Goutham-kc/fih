import PendingIntent from '@/models/PendingIntent';

const INTENT_TTL_MINUTES = 30;

/**
 * Create or update a pending intent for a user.
 */
export async function createPendingIntent(userId, { module, partialData, missingField, question }) {
  const expiresAt = new Date(Date.now() + INTENT_TTL_MINUTES * 60 * 1000);
  await PendingIntent.findOneAndUpdate(
    { userId },
    { userId, module, partialData, missingField, question, expiresAt },
    { upsert: true, new: true }
  );
}

/**
 * Retrieve the active pending intent for a user (if any).
 */
export async function getPendingIntent(userId) {
  return PendingIntent.findOne({ userId });
}

/**
 * Delete the pending intent for a user.
 */
export async function clearPendingIntent(userId) {
  await PendingIntent.deleteOne({ userId });
}
