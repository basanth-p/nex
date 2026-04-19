import { NextResponse } from 'next/server';
import { generateSprintDemoDigest } from '@/lib/sprint/demo';
import { sendTelegramMessage } from '@/lib/notifications/telegram';

export async function GET() {
  const digest = await generateSprintDemoDigest();
  await sendTelegramMessage(digest);
  return NextResponse.json({ success: true });
}