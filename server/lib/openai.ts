import OpenAI from "openai";
import { EventDetails, GeneratedPost } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_development" });

/**
 * Generate a LinkedIn post based on event details and images
 */
export async function generatePost(eventDetails: EventDetails, imageBuffers: string[] = []): Promise<GeneratedPost> {
  try {
    // Analyze images if available
    let imageAnalysis = "";
    
    if (imageBuffers.length > 0) {
      // Analyze the first image to get context
      imageAnalysis = await analyzeImage(imageBuffers[0]);
    }
    
    // Construct the prompt
    const prompt = `
Generate a LinkedIn post about an event or achievement with the following details:

Event Title: ${eventDetails.title}
${eventDetails.date ? `Date: ${eventDetails.date}` : ''}
${eventDetails.location ? `Location: ${eventDetails.location}` : ''}
${eventDetails.description ? `Description: ${eventDetails.description}` : ''}
${eventDetails.connections ? `People/Companies: ${eventDetails.connections}` : ''}
Tone Preference: ${eventDetails.tonePreference || 'professional'}

${imageAnalysis ? `Image Analysis: ${imageAnalysis}` : ''}

Create a LinkedIn post that:
1. Sounds natural and conversational, not like AI-generated content
2. Uses a ${eventDetails.tonePreference || 'professional'} tone
3. Is personal and includes first-person perspective
4. Includes 2-4 relevant hashtags
5. Keeps paragraphs concise and spaced out for readability
6. Makes specific references to the event details
7. Mentions connections/people met if provided
8. Is between 150-250 words
9. Includes emojis sparingly if appropriate

Return a JSON object with format:
{
  "content": "The full text of the LinkedIn post",
  "hashtags": ["array", "of", "hashtags"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional LinkedIn content writer who specializes in creating authentic, engaging posts that sound like they were written by a real person, not AI. You match the user's writing style and tone preferences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const generatedContent = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      content: generatedContent.content || "",
      hashtags: generatedContent.hashtags || [],
    };
  } catch (error) {
    console.error("Error generating LinkedIn post with OpenAI:", error);
    throw new Error("Failed to generate LinkedIn post content");
  }
}

/**
 * Analyze a user's writing style from samples
 */
export async function analyzeWritingStyle(samples: string): Promise<{
  writingPatterns: string;
  tonalCharacteristics: string;
  vocabularyInsights: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a linguistic analyst specializing in identifying writing patterns and styles. Analyze the provided writing samples and extract key characteristics that define the author's unique style."
        },
        {
          role: "user",
          content: `Analyze the following writing samples and provide insights about the author's writing style, tone, vocabulary, and patterns. Format your response as JSON.

Samples:
${samples}

Return a JSON object with:
{
  "writingPatterns": "Detailed analysis of sentence structure, paragraph length, transitions, etc.",
  "tonalCharacteristics": "Analysis of the emotional tone, formality level, etc.",
  "vocabularyInsights": "Notes on word choice, industry jargon, and distinctive phrases"
}`
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing writing style with OpenAI:", error);
    throw new Error("Failed to analyze writing style");
  }
}

/**
 * Analyze an image to get context for post generation
 */
async function analyzeImage(base64Image: string): Promise<string> {
  try {
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and provide a brief description of what it shows related to a professional event or achievement. Focus on people, setting, activities, and any text visible."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 300,
    });

    return visionResponse.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    return ""; // Return empty string if analysis fails
  }
}
