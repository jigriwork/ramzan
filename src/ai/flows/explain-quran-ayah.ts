'use server';
/**
 * @fileOverview A Genkit flow for generating contextual explanations for Quranic ayahs.
 *
 * - quranAyahContextualExplanation - A function that handles the AI explanation process for a Quran ayah.
 * - QuranAyahContextualExplanationInput - The input type for the quranAyahContextualExplanation function.
 * - QuranAyahContextualExplanationOutput - The return type for the quranAyahContextualExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuranAyahContextualExplanationInputSchema = z.object({
  surahNumber: z.number().describe('The surah number of the Quran ayah.'),
  ayahNumber: z.number().describe('The ayah number within the surah.'),
  arabicText: z.string().describe('The Arabic text of the Quran ayah.'),
  transliteration: z.string().describe('The transliteration of the Arabic text.'),
  translationEn: z.string().describe('The English translation of the Quran ayah.'),
});
export type QuranAyahContextualExplanationInput = z.infer<typeof QuranAyahContextualExplanationInputSchema>;

const QuranAyahContextualExplanationOutputSchema = z.object({
  explanation: z.string().describe('A detailed contextual explanation of the Quran ayah.'),
});
export type QuranAyahContextualExplanationOutput = z.infer<typeof QuranAyahContextualExplanationOutputSchema>;

export async function quranAyahContextualExplanation(input: QuranAyahContextualExplanationInput): Promise<QuranAyahContextualExplanationOutput> {
  return quranAyahContextualExplanationFlow(input);
}

const quranAyahContextualExplanationPrompt = ai.definePrompt({
  name: 'quranAyahContextualExplanationPrompt',
  input: {schema: QuranAyahContextualExplanationInputSchema},
  output: {schema: QuranAyahContextualExplanationOutputSchema},
  prompt: `You are an expert Islamic scholar and teacher, providing deep contextual explanations for Quranic verses.

Provide a comprehensive explanation for the following Quranic ayah, including its meaning, historical context (Asbab al-Nuzul if applicable), spiritual significance, and any relevant lessons or interpretations.

Here is the information about the ayah:

Surah Number: {{{surahNumber}}}
Ayah Number: {{{ayahNumber}}}
Arabic Text: {{{arabicText}}}
Transliteration: {{{transliteration}}}
English Translation: {{{translationEn}}}

Your explanation should be insightful, clear, and easy to understand for a general audience. Avoid academic jargon where possible, but maintain scholarly accuracy. Focus on a tone that is positive, welcoming, and non-judgmental.`,
});

const quranAyahContextualExplanationFlow = ai.defineFlow(
  {
    name: 'quranAyahContextualExplanationFlow',
    inputSchema: QuranAyahContextualExplanationInputSchema,
    outputSchema: QuranAyahContextualExplanationOutputSchema,
  },
  async input => {
    const {output} = await quranAyahContextualExplanationPrompt(input);
    return output!;
  }
);
