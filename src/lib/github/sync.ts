import { Octokit } from '@octokit/rest';
import { supabase } from '@/lib/supabase/client';
import { scoreIssue } from '@/lib/sprint/scorer';

// Repo → PAT mapping
const REPO_CONFIG: { repo: string; owner: string; pat: string }[] = [
/*  {
    owner: 'SquaredSplit-v1',      // replace with actual org name
    repo: 'squaredSplitApp',
    pat: process.env.GITHUB_PAT_SQUAREDSPLIT!
  },
  {
    owner: 'sahayakunovative-ai',           // replace with actual org name
    repo: 'Sahayak',
    pat: process.env.GITHUB_PAT_SAHAYAK!
  },
*/  
  {
    owner: 'Basanth-Builds', // replace with actual username/org
    repo: 'court-iq-qpi',
    pat: process.env.GITHUB_PAT_BASANTHBUILDS!
  },
  {
    owner: 'Basanth-Builds',
    repo: 'courtiq',
    pat: process.env.GITHUB_PAT_BASANTHBUILDS!
  },
/*  
  {
    owner: 'nirmalamin24bak',
    repo: 'finora-app',
    pat: process.env.GITHUB_PAT_FINORA!
  },
*/  
];

export async function syncAllIssuesFromGitHub(): Promise<void> {
  const yourUsername = process.env.NEX_OWNER_GITHUB_USERNAME!;

  for (const config of REPO_CONFIG) {
    try {
      const octokit = new Octokit({ auth: config.pat });

      // Fetch open issues assigned to you in this repo
      const { data: issues } = await octokit.issues.listForRepo({
        owner: config.owner,
        repo: config.repo,
        assignee: yourUsername,
        state: 'open',
        per_page: 50,
      });

      // Filter out pull requests (GitHub API returns PRs in issues endpoint)
      const realIssues = issues.filter(issue => !issue.pull_request);

      for (const issue of realIssues) {
        const repoFullName = `${config.owner}/${config.repo}`;
        const labels = issue.labels.map(l =>
          typeof l === 'string' ? l : l.name ?? ''
        );

        const priorityScore = scoreIssue({
          labels,
          sprint_id: null,
          created_at: issue.created_at,
          repo: repoFullName,
        });

        // Upsert into Supabase — update if exists, insert if new
        await supabase.from('issues').upsert({
          github_issue_number: issue.number,
          repo: repoFullName,
          title: issue.title,
          body: issue.body ?? '',
          labels,
          assignee: yourUsername,
          state: issue.state,
          priority_score: priorityScore,
          created_at: issue.created_at,
          closed_at: issue.closed_at ?? null,
        }, { onConflict: 'github_issue_number,repo' });
      }

      console.log(`✅ Synced ${realIssues.length} issues from ${config.owner}/${config.repo}`);

    } catch (err) {
      console.error(`❌ Failed to sync ${config.owner}/${config.repo}:`, err);
      // Don't throw — continue syncing other repos even if one fails
    }
  }
}