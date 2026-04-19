import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

export async function classifySeverity(errorSummary: string): Promise<'p0' | 'p1' | 'p2'> {
  const result = await hf.zeroShotClassification({
    model: 'facebook/bart-large-mnli',
    inputs: errorSummary,
    parameters: {
      candidate_labels: [
        'production is completely down',
        'important feature is broken',
        'minor bug or cosmetic issue'
      ]
    }
  });

  // SDK returns either an array or a single object depending on input type
  const output = Array.isArray(result) ? result[0] : result;
  const typed = output as unknown as { label: string; score: number } [];

  const topLabel = typed[0].label.toLowerCase();

  if (topLabel.includes('completely down')) return 'p0';
  if (topLabel.includes('important feature')) return 'p1';
  return 'p2';
}
