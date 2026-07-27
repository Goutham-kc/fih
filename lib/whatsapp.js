import crypto from 'crypto';

/**
 * Verify Meta webhook signature.
 */
export function isValidSignature(rawBody, signatureHeader) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.warn('WHATSAPP_APP_SECRET not configured — skipping signature check for setup.');
    return true;
  }
  if (!signatureHeader) return false;
  try {
    const expected =
      'sha256=' +
      crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Send a WhatsApp text message to a recipient.
 * @param {string} to  – E.164 phone number, e.g. '+919800000000'
 * @param {string} text – message body
 */
export async function sendWhatsAppMessage(to, text) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN in env vars');
    return;
  }

  const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: to.replace(/^\+/, ''), // Meta Cloud API expects digits only (e.g. 917012400637)
    type: 'text',
    text: { body: text },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('WhatsApp send error:', err);
    }
    return res;
  } catch (err) {
    console.error('Fetch error sending WhatsApp message:', err);
  }
}
