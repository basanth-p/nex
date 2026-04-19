import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.NEX_APP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await req.json();
  console.log('CI failure received:', payload);

  // TODO: fetch workflow logs via GitHub API and process with HuggingFace

  return NextResponse.json({ received: true });
}