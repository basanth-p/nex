const NTFY_BASE_URL = 'https://ntfy.sh';

interface NtfyOptions {
  title?: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  topic?: string;
}

export async function sendNotification(
  message: string,
  options: NtfyOptions = {}
): Promise<void> {
  const topic = options.topic ?? process.env.NTFY_TOPIC!;
  const priority = options.priority ?? 3;

  const safeTitle = options.title
    ? options.title.replace(/[^\x00-\x7F]/g, '').trim()
    : undefined;

  await fetch(`${NTFY_BASE_URL}/${topic}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      ...(safeTitle && { 'X-Title': safeTitle }),
      'X-Priority': String(priority),
      ...(options.tags && { 'X-Tags': options.tags.join(',') }),
    },
    body: message,
  });
}
