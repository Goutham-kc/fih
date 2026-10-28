import { sendWhatsAppMessage } from '@/lib/whatsapp';
import User from '@/models/User';
import ProcessedMessage from '@/models/ProcessedMessage';
import AuditLog from '@/models/AuditLog';
import { connectDB } from '@/lib/db';

export default async function handler(req, res) {
  try {
    await connectDB();
    const users = await User.find({});
    const phone = req.query.phone || users[0]?.whatsappNumber || '919000000000';

    const recentProcessed = await ProcessedMessage.find({}).sort({ createdAt: -1 }).limit(5);
    const recentAudit = await AuditLog.find({}).sort({ createdAt: -1 }).limit(5);

    let sendResult = null;
    if (req.query.skip_send !== 'true') {
      const apiRes = await sendWhatsAppMessage(phone, "🧪 Test message from FIH WhatsApp Assistant Diagnostic!");
      if (apiRes) {
        let bodyText = '';
        try { bodyText = await apiRes.text(); } catch {}
        sendResult = {
          ok: apiRes.ok,
          metaStatus: apiRes.status,
          metaResponseBody: bodyText,
        };
      } else {
        sendResult = { error: 'sendWhatsAppMessage returned null (check WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN)' };
      }
    }

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      envCheck: {
        hasPhoneId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
        phoneIdLength: process.env.WHATSAPP_PHONE_NUMBER_ID ? process.env.WHATSAPP_PHONE_NUMBER_ID.length : 0,
        hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
        accessTokenPrefix: process.env.WHATSAPP_ACCESS_TOKEN ? process.env.WHATSAPP_ACCESS_TOKEN.substring(0, 10) + '...' : null,
        hasVerifyToken: !!process.env.WHATSAPP_VERIFY_TOKEN,
        hasAppSecret: !!process.env.WHATSAPP_APP_SECRET,
        hasMongoUri: !!process.env.MONGODB_URI,
      },
      database: {
        usersCount: users.length,
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          whatsappNumber: u.whatsappNumber,
          mode: u.environmentMode || 'live'
        })),
        recentProcessedCount: recentProcessed.length,
        recentProcessedMessages: recentProcessed.map(p => ({ messageId: p.messageId, createdAt: p.createdAt })),
        recentAuditLogs: recentAudit.map(a => ({ module: a.module, action: a.action, desc: a.description, createdAt: a.createdAt })),
      },
      testSendTo: phone,
      testSendResult: sendResult
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
