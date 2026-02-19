'use server';
/**
 * @fileOverview A Genkit flow to generate a personalized daily insight for the user.
 *
 * - generatePersonalizedInsight - A function that handles the personalized insight generation process.
 * - GeneratePersonalizedInsightInput - The input type for the generatePersonalizedInsight function.
 * - GeneratePersonalizedInsightOutput - The return type for the generatePersonalizedInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const GeneratePersonalizedInsightInputSchema = z.object({
  lastReadAyahs: z.array(z.string()).optional().describe('A list of recently read Quranic verses, e.g., "Surah Al-Fatiha, Ayah 3".'),
  bookmarkedAyahs: z.array(z.string()).optional().describe('A list of bookmarked Quranic verses, e.g., "Surah Al-Baqarah, Ayah 255".'),
  favoritedDuas: z.array(z.string()).optional().describe('A list of favorited Duas, e.g., "Iftar Dua".'),
});
export type GeneratePersonalizedInsightInput = z.infer<typeof GeneratePersonalizedInsightInputSchema>;

// Output Schema
const GeneratePersonalizedInsightOutputSchema = z.object({
  insightType: z.enum(['ayah', 'dua']).describe('The type of the generated insight, either "ayah" or "dua".'),
  referenceArabic: z.string().describe('The Arabic text of the selected Quranic ayah or Dua.'),
  referenceTransliteration: z.string().describe('The Roman transliteration of the reference Arabic text.'),
  referenceTranslationEn: z.string().describe('The English translation of the reference Arabic text.'),
  reflection: z.string().describe('A short (around 50-100 words), positive, welcoming, non-judgmental, and encouraging reflection based on the reference text and user\'s interactions. Focus on spiritual growth and good character.'),
  referenceSource: z.string().describe('The source of the reference, e.g., "Surah Al-Fatiha, Ayah 1-7" or "Dua for Iftar".'),
});
export type GeneratePersonalizedInsightOutput = z.infer<typeof GeneratePersonalizedInsightOutputSchema>;

// Wrapper function to call the flow
export async function generatePersonalizedInsight(input: GeneratePersonalizedInsightInput): Promise<GeneratePersonalizedInsightOutput> {
  return generatePersonalizedInsightFlow(input);
}

// Define the prompt
const personalizedInsightPrompt = ai.definePrompt({
  name: 'personalizedInsightPrompt',
  input: {schema: GeneratePersonalizedInsightInputSchema},
  output: {schema: GeneratePersonalizedInsightOutputSchema},
  prompt: `You are an encouraging and wise spiritual guide for the NoorRamzan app.
Your task is to provide a personalized daily insight consisting of a relevant Quranic ayah or Dua and a short, encouraging reflection.
The insight should be tailored to the user's past interactions.

Here is the user's interaction history:
{{#if lastReadAyahs.length}}
Last Read Ayahs:
{{#each lastReadAyahs}}- {{{this}}}
{{/each}}
{{/if}}
{{#if bookmarkedAyahs.length}}
Bookmarked Ayahs:
{{#each bookmarkedAyahs}}- {{{this}}}
{{/each}}
{{/if}}
{{#if favoritedDuas.length}}
Favorited Duas:
{{#each favoritedDuas}}- {{{this}}}
{{/each}}
{{/if}}
{{#unless lastReadAyahs.length}}{{#unless bookmarkedAyahs.length}}{{#unless favoritedDuas.length}}
No specific interaction history is available. Provide a general but uplifting insight relevant to daily life and spiritual growth.
{{/unless}}{{/unless}}{{/unless}}

Based on this, generate one relevant insight.
The insight must include:
1.  **insightType**: "ayah" if it's a Quranic verse, "dua" if it's a prayer.
2.  **referenceArabic**: The Arabic text of the selected Quranic ayah or Dua.
3.  **referenceTransliteration**: The Roman transliteration to aid pronunciation.
4.  **referenceTranslationEn**: The English translation.
5.  **reflection**: A short (around 50-100 words), positive, welcoming, non-judgmental, and encouraging reflection. Focus on spiritual growth, good character, and making the user feel more connected to their faith. Make it feel personal to their journey based on their history.
6.  **referenceSource**: A clear source for the reference, e.g., "Surah Al-Fatiha, Ayah 1-7" or "Dua for Iftar".

Ensure the output is valid JSON that strictly matches the specified schema.
`,
});

// Define the Genkit flow
const generatePersonalizedInsightFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedInsightFlow',
    inputSchema: GeneratePersonalizedInsightInputSchema,
    outputSchema: GeneratePersonalizedInsightOutputSchema,
  },
  async (input) => {
    const {output} = await personalizedInsightPrompt(input);
    if (!output) {
        throw new Error('Failed to generate personalized insight.');
    }
    return output;
  }
);
