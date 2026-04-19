import { createHmac, timingSafeEqual } from 'crypto';

export async function validateWebhookSignature(body: string, signature: string): Promise<boolean> {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expBuffer.length) return false;
  return timingSafeEqual(sigBuffer, expBuffer);
}
