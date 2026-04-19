import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

// Summarize stack traces and error logs into plain English
export async function summarizeError(rawText: string): Promise<string> {
  const result = await hf.summarization({
    model: 'facebook/bart-large-cnn',
    inputs: rawText.slice(0, 1024), // BART max input
    parameters: { max_length: 120, min_length: 30 }
  });
  return result.summary_text;
}

// Classify severity using zero-shot classification
export async function classifySeverity(
  errorSummary: string
): Promise<'p0' | 'p1' | 'p2'> {
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

  const topLabel = result.labels[0];
  if (topLabel.includes('completely down')) return 'p0';
  if (topLabel.includes('important feature')) return 'p1';
  return 'p2';
}

// Summarize a batch of GitHub issues for standup/sprint planning
export async function summarizeIssues(issues: string[]): Promise<string> {
  const combined = issues.join('\n---\n').slice(0, 2048);
  const result = await hf.summarization({
    model: 'facebook/bart-large-cnn',
    inputs: combined,
    parameters: { max_length: 200, min_length: 60 }
  });
  return result.summary_text;
}

// Extract action items from meeting notes / issue comments
export async function extractActionItems(text: string): Promise<string[]> {
  const result = await hf.questionAnswering({
    model: 'deepset/roberta-base-squad2',
    inputs: {
      question: 'What are the action items and tasks mentioned?',
      context: text.slice(0, 512)
    }
  });
  // Parse the answer into a list (simple split on commas/newlines)
  return result.answer
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean);
}