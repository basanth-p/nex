import { supabase } from '@/lib/supabase/client';
import { startOfWeek, endOfWeek, format } from 'date-fns';

const PRIORITY_EMOJI: Record<string, string> = {
  'p0-critical': '🔴',
  'p1-high': '🟡',
  'bug': '🟠',
  'feature': '🔵',
  'nex-detected': '⚡',
};

export async function buildSprintPlan(): Promise<object> {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });     // Sunday

  // Upsert sprint for this week across all projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true);

  if (!projects?.length) return {};

  // Fetch all open issues sorted by priority
  const { data: issues } = await supabase
    .from('issues')
    .select('*')
    .eq('state', 'open')
    .order('priority_score', { ascending: false });

  // Group by repo
  const grouped: Record<string, typeof issues> = {};
  for (const issue of issues ?? []) {
    if (!grouped[issue.repo]) grouped[issue.repo] = [];
    grouped[issue.repo]!.push(issue);
  }

  return { weekStart, weekEnd, grouped, totalIssues: issues?.length ?? 0 };
}

export function formatSprintPlanForNotification(plan: {
  weekStart: Date;
  weekEnd: Date;
  grouped: Record<string, { title: string; labels: string[]; priority_score: number }[]>;
  totalIssues: number;
}): string {
  const lines: string[] = [
    `🗓️ *Sprint Plan — Week of ${format(new Date(plan.weekStart), 'MMM d')}*`,
    `📊 ${plan.totalIssues} open issues across ${Object.keys(plan.grouped).length} repos\n`,
  ];

  for (const [repo, issues] of Object.entries(plan.grouped)) {
    const repoName = repo.split('/')[1];
    lines.push(`*${repoName}* (${issues.length})`);

    issues.slice(0, 3).forEach(issue => {
      const emoji = issue.labels.find(l => PRIORITY_EMOJI[l])
        ? PRIORITY_EMOJI[issue.labels.find(l => PRIORITY_EMOJI[l])!]
        : '⚪';
      lines.push(`  ${emoji} ${issue.title.slice(0, 60)}`);
    });

    if (issues.length > 3) lines.push(`  ... +${issues.length - 3} more`);
    lines.push('');
  }

  return lines.join('\n');
}