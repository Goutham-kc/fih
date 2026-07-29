import { sendWhatsAppMessage } from '@/lib/whatsapp';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export default async function handler(req, res) {
  try {
    await connectDB();
    const users = await User.find({});
    const phone = users[0]?.whatsappNumber || '919000000000';

    const apiRes = await sendWhatsAppMessage(phone, "🧪 Test message from FIH WhatsApp Assistant Diagnostic!");

    if (!apiRes) {
      return res.status(500).json({
        error: 'sendWhatsAppMessage returned null (missing env vars)',
        envCheck: {
          hasPhoneId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
          hasToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
          hasVerifyToken: !!process.env.WHATSAPP_VERIFY_TOKEN,
        }
      });
    }

    const status = apiRes.status;
    let bodyText = '';
    try { bodyText = await apiRes.text(); } catch {}

    return res.status(200).json({
      ok: apiRes.ok,
      metaStatus: status,
      metaResponseBody: bodyText,
      targetPhone: phone,
      envCheck: {
        hasPhoneId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
        hasToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
        hasVerifyToken: !!process.env.WHATSAPP_VERIFY_TOKEN,
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
