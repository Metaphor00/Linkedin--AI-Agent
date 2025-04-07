import { EventDetails } from '@shared/schema';

export async function generateLinkedInPost(eventDetails: EventDetails, imageUrls: string[]) {
  try {
    const response = await fetch('/api/ai/generate-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventDetails,
        imageUrls,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error generating post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in OpenAI generation:', error);
    throw error;
  }
}

export async function analyzeUserWritingStyle(samples: string) {
  try {
    const response = await fetch('/api/ai/analyze-style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        samples,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error analyzing writing style: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in OpenAI style analysis:', error);
    throw error;
  }
}
