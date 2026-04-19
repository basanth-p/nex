const NTFY_BASE_URL = 'https://ntfy.sh';

interface NtfyOptions {
  title?: string;
  priority?: 1 | 2 | 3 | 4 | 5; // 1=min, 3=default, 5=max
  tags?: string[];        // emoji tags shown in notification
  topic?: string;         // override default topic
}

export async function sendNotification(
  message: string,
  options: NtfyOptions = {}
): Promise<void> {
  const topic = options.topic ?? process.env.NTFY_TOPIC!;
  const priority = options.priority ?? 3;

  await fetch(`${NTFY_BASE_URL}/${topic}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      ...(options.title && { 'X-Title': options.title }),
      'X-Priority': String(priority),
      ...(options.tags && { 'X-Tags': options.tags.join(',') }),
    },
    body: message,
  });
}