// src/app/api/webhook/ci-failure/route.ts
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.NEX_APP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...proceed
}