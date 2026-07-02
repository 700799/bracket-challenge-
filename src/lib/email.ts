/**
 * Minimal, pluggable email sender. Uses Resend's HTTP API when `RESEND_API_KEY`
 * and `EMAIL_FROM` are configured; otherwise it's a no-op that reports 0 sent,
 * so announcements still post to the page without an email provider.
 */

export interface EmailEnv {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}

export interface BulkEmail {
  recipients: string[];
  subject: string;
  text: string;
}

/** Returns the number of recipients emailed (0 if email is unavailable). */
export async function sendBulkEmail(
  env: EmailEnv,
  msg: BulkEmail,
): Promise<number> {
  const key = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM;
  const to = [...new Set(msg.recipients.filter(Boolean))];
  if (!key || !from || to.length === 0) return 0;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      // Send to the sender, BCC the members (keeps recipient list private).
      body: JSON.stringify({
        from,
        to: from,
        bcc: to,
        subject: msg.subject,
        text: msg.text,
      }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok ? to.length : 0;
  } catch {
    return 0;
  }
}
