export function scoreIssue(issue: { labels: string[]; sprint_id: string | null; created_at: string; repo: string }): number {
  let score = 0;
  if (issue.labels.includes('p0-critical')) score += 40;
  if (issue.labels.includes('p1-high')) score += 25;
  if (issue.labels.includes('bug')) score += 20;
  if (issue.labels.includes('nex-detected')) score += 15;
  if (issue.sprint_id) score += 30;
  return score;
}
