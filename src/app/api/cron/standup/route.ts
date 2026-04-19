import { NextResponse } from 'next/server';
import { buildDaySchedule } from '@/lib/sprint/scheduler';
import { generateStandupDraft } from '@/lib/sprint/standup';
import { sendNotification } from '@/lib/notifications/ntfy';

function formatDayScheduleMessage(schedule: object[] | null, standup: string): string {
  const dateStr = new Date().toDateString();
  return `📋 *Nex Day Plan — ${dateStr}*\n\n${standup || 'No standup draft yet.'}\n\n_${schedule?.length ?? 0} tasks scheduled for today._`;
}

export async function GET() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  if (dayOfWeek < 2 || dayOfWeek > 4) {
    return NextResponse.json({ skipped: true });
  }
  const schedule = await buildDaySchedule(today);
  const standup = await generateStandupDraft();
  await sendNotification(formatDayScheduleMessage(schedule, standup));
  return NextResponse.json({ success: true });
}