import { supabase } from '@/lib/supabase/client';
import { scoreIssue } from './scorer';
import { format, addMinutes } from 'date-fns';

const DEFAULT_ESTIMATES: Record<string, number> = {
  'p0-critical': 90,
  'bug': 60,
  'feature': 90,
  'documentation': 30,
  'refactor': 45,
  'nex-detected': 45
};

export async function buildDaySchedule(date: Date) {
  // 1. Fetch all open issues assigned to you
  const { data: issues } = await supabase
    .from('issues')
    .select('*')
    .eq('assignee', process.env.NEX_OWNER_GITHUB_USERNAME)
    .eq('state', 'open')
    .order('priority_score', { ascending: false });

  if (!issues?.length) return null;

  // 2. Get velocity estimates from historical data
  const { data: velocity } = await supabase
    .from('issue_velocity')
    .select('*');

  const velocityMap = new Map(velocity?.map(v => [v.label, v.avg_close_minutes]));

  // 3. Score and sort issues
  const scored = issues.map(issue => ({
    ...issue,
    priority_score: scoreIssue(issue),
    estimated_minutes: estimateTime(issue, velocityMap)
  })).sort((a, b) => b.priority_score - a.priority_score);

  // 4. Build time blocks (9 AM start, 8 hrs, 1 hr lunch at 12:30)
  const schedule = [];
  let currentTime = new Date(date);
  currentTime.setHours(9, 0, 0, 0);

  const lunchStart = new Date(date);
  lunchStart.setHours(12, 30, 0, 0);
  const lunchEnd = new Date(date);
  lunchEnd.setHours(13, 30, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0); // 5 PM cap, last 15 min for EOD standup

  for (const issue of scored) {
    if (currentTime >= endOfDay) break;

    // Insert lunch break
    if (currentTime < lunchStart &&
        addMinutes(currentTime, issue.estimated_minutes) > lunchStart) {
      currentTime = lunchEnd;
    }

    const end = addMinutes(currentTime, issue.estimated_minutes);
    schedule.push({
      start: format(currentTime, 'HH:mm'),
      end: format(end, 'HH:mm'),
      issue_number: issue.github_issue_number,
      repo: issue.repo,
      title: issue.title,
      estimated_minutes: issue.estimated_minutes,
      priority_score: issue.priority_score,
      labels: issue.labels
    });

    currentTime = end;
  }

  // Add EOD standup slot
  schedule.push({
    start: '16:45',
    end: '17:00',
    title: '✍️ EOD Standup — Nex will draft this',
    estimated_minutes: 15,
    type: 'standup'
  });

  // 5. Save to Supabase
  await supabase.from('daily_schedules').upsert({
    schedule_date: format(date, 'yyyy-MM-dd'),
    schedule_json: schedule,
    total_estimated_minutes: schedule.reduce((sum, s) => sum + (s.estimated_minutes || 0), 0)
  }, { onConflict: 'schedule_date' });

  return schedule;
}

function estimateTime(
  issue: { labels: string[]; estimated_minutes?: number },
  velocityMap: Map<string, number>
): number {
  // Check if velocity data exists for any of the issue's labels
  for (const label of issue.labels) {
    const velocity = velocityMap.get(label);
    if (velocity) return velocity;
  }

  // Fall back to defaults
  for (const label of issue.labels) {
    if (DEFAULT_ESTIMATES[label]) return DEFAULT_ESTIMATES[label];
  }

  return 60; // Default 60 min if no data
}