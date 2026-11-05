import AuditLog from '@/models/AuditLog';

/**
 * Log a user action to the audit logs.
 */
export async function logAudit(userId, { action, module, description, environmentMode = 'live' }) {
  try {
    await AuditLog.create({
      userId,
      action,
      module,
      description,
      environmentMode
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
