import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookSignature } from '@/lib/github/auth';
import { handleIssueEvent } from '@/lib/handlers/issue';
import { handleWorkflowEvent } from '@/lib/handlers/workflow';
import { handleDeploymentEvent } from '@/lib/handlers/deployment';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-hub-signature-256') || '';
  const event = req.headers.get('x-github-event') || '';

  // Validate webhook signature
  const isValid = await validateWebhookSignature(body, signature);
  if (!isValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = JSON.parse(body);

  // Route to correct handler
  switch (event) {
    case 'issues':
      await handleIssueEvent(payload);
      break;
    case 'workflow_run':
      if (payload.workflow_run.conclusion === 'failure') {
        await handleWorkflowEvent(payload);
      }
      break;
    case 'deployment_status':
      if (payload.deployment_status.state === 'failure') {
        await handleDeploymentEvent(payload);
      }
      break;
  }

  return NextResponse.json({ received: true });
}