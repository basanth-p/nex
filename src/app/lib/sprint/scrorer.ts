interface Issue {
  labels: string[];
  sprint_id: string | null;
  created_at: string;
  repo: string;
}

const CLIENT_FACING_REPOS = [
  'yourusername/billsplit-web',
  'yourusername/fleet-dashboard'
];

export function scoreIssue(issue: Issue): number {
  let score = 0;

  // Label-based scoring
  if (issue.labels.includes('p0-critical')) score += 40;
  if (issue.labels.includes('p1-high')) score += 25;
  if (issue.labels.includes('bug')) score += 20;
  if (issue.labels.includes('nex-detected')) score += 15;

  // Sprint assignment
  if (issue.sprint_id) score += 30;

  // Client-facing project
  if (CLIENT_FACING_REPOS.includes(issue.repo)) score += 20;

  // Staleness (days without activity)
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(issue.created_at).getTime()) / 86400000
  );
  if (daysSinceCreation > 3) score += 10;
  if (daysSinceCreation > 7) score += 15;

  return score;
}