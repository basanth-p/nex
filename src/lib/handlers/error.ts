export async function processErrorEvent(event: {
  source: string;
  title: string;
  stackTrace: string;
  projectRepo: string;
  url?: string;
}): Promise<void> {
  // TODO: implement full error processing pipeline
  console.log('Error event received from:', event.source);
}
