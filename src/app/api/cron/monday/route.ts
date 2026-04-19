import { NextResponse } from 'next/server';
import { syncAllIssuesFromGitHub } from '@/lib/github/sync';
import { buildSprintPlan } from '@/lib/sprint/planner';
import { sendNotification } from '@/lib/notifications/ntfy';

function formatSprintPlanMessage(plan: object): string {
  return `🗓️ *Nex Sprint Plan — Week Starting ${new Date().toDateString()}*\n\n_Sprint planning sync complete. Issues loaded across all projects._`;
}

export async function GET() {
  await syncAllIssuesFromGitHub();
  const sprintPlan = await buildSprintPlan();
  await sendNotification(formatSprintPlanMessage(sprintPlan));
  return NextResponse.json({ success: true });
}