import { NextResponse } from 'next/server';
import { buildDaySchedule } from '@/lib/sprint/scheduler';
import { generateStandupDraft } from '@/lib/sprint/standup';
import { sendTelegramMessage } from '@/lib/notifications/telegram';

export async function GET() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat

  // Only run Tue-Thu
  if (dayOfWeek < 2 || dayOfWeek > 4) {
    return NextResponse.json({ skipped: true });
  }

  // 1. Build today's schedule
  const schedule = await buildDaySchedule(today);

  // 2. Generate standup draft (what you did yesterday, what's today)
  const standup = await generateStandupDraft();

  // 3. Send to Telegram
  await sendTelegramMessage(formatDayScheduleMessage(schedule, standup));

  return NextResponse.json({ success: true });
}