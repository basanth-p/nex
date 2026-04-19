import { NextResponse } from 'next/server';
import { syncAllIssuesFromGitHub } from '@/lib/github/sync';
import { buildSprintPlan, formatSprintPlanForNotification } from '@/lib/sprint/planner';
import { sendNotification } from '@/lib/notifications/ntfy';

export async function GET() {
  await syncAllIssuesFromGitHub();
  const sprintPlan = await buildSprintPlan() as Parameters<typeof formatSprintPlanForNotification>[0];
  const message = formatSprintPlanForNotification(sprintPlan);

  await sendNotification(message, {
    title: '🗓️ Nex Sprint Plan Ready',
    priority: 3,
    tags: ['spiral_notepad']
  });

  return NextResponse.json({ success: true });
}