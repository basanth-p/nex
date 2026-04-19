export async function createGitHubIssue(params: {
  repo: string;
  title: string;
  body: string;
  labels: string[];
  assignee: string;
}): Promise<number> {
  // TODO: implement GitHub issue creation via Octokit
  console.log('Creating GitHub issue:', params.title);
  return 0;
}
