import { NextResponse } from 'next/server';
import { generateSprintDemoDigest } from '@/lib/sprint/demo';
import { sendNotification } from '@/lib/notifications/ntfy';

export async function GET() {
  const digest = await generateSprintDemoDigest();
  await sendNotification(digest);
  return NextResponse.json({ success: true });
}