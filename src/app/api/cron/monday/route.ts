import { NextResponse } from 'next/server';
import { syncAllIssuesFromGitHub } from '@/lib/github/sync';
import { buildSprintPlan } from '@/lib/sprint/planner';
import { sendTelegramMessage } from '@/lib/notifications/telegram';

export async function GET() {
  // 1. Sync all issues from GitHub across all registered repos
  await syncAllIssuesFromGitHub();

  // 2. Create a new sprint for this week
  const sprintPlan = await buildSprintPlan();

  // 3. Notify
  await sendTelegramMessage(formatSprintPlanMessage(sprintPlan));

  return NextResponse.json({ success: true });
}