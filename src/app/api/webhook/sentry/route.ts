import { NextRequest, NextResponse } from 'next/server';
import { processErrorEvent } from '@/lib/handlers/error';

export async function POST(req: NextRequest) {
  const payload = await req.json();

  // Sentry sends action: "triggered" for new issues
  if (payload.action === 'triggered' || payload.action === 'created') {
    await processErrorEvent({
      source: 'sentry',
      title: payload.data?.issue?.title,
      stackTrace: payload.data?.issue?.culprit,
      projectRepo: mapSentryProjectToRepo(payload.data?.issue?.project?.slug),
      url: payload.data?.issue?.web_url
    });
  }

  return NextResponse.json({ received: true });
}

function mapSentryProjectToRepo(slug: string): string {
  // Map your Sentry project slugs to GitHub repo names
  const map: Record<string, string> = {
    'billsplit-api': 'yourusername/billsplit-api',
    'fleet-dashboard': 'yourusername/fleet-dashboard',
  };
  return map[slug] || slug;
}