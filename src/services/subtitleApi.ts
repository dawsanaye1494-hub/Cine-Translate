import { BurmeseStyle, StyleComparisonItem, SubtitleCue } from '../types/subtitle';

export interface TranslatedCueResponse {
  id: string;
  burmeseText: string;
  romanizedPronunciation: string;
  styleNuanceNote: string;
  otherTranslations: Array<{ language: string; text: string }>;
}

export async function translateCuesBatch(params: {
  cues: SubtitleCue[];
  burmeseStyle: BurmeseStyle;
  targetLanguages: string[];
  movieContext: string;
  glossary: string;
}): Promise<{ translatedCues: TranslatedCueResponse[] }> {
  const response = await fetch('/api/subtitles/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to translate subtitle cues.');
  }
  return data;
}

export async function compareAllSixStyles(params: {
  sourceText: string;
  movieContext: string;
  speaker: string;
}): Promise<{ comparisons: StyleComparisonItem[] }> {
  const response = await fetch('/api/subtitles/compare-styles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to compare all 6 Burmese styles.');
  }
  return data;
}

export async function segmentAndTranslateScript(params: {
  rawScript: string;
  burmeseStyle: BurmeseStyle;
  targetDurationSeconds?: number;
}): Promise<{
  cues: Array<{
    index: number;
    startTime: string;
    endTime: string;
    speaker: string;
    sourceText: string;
    burmeseText: string;
    styleNuanceNote: string;
  }>;
}> {
  const response = await fetch('/api/subtitles/segment-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to segment and translate script.');
  }
  return data;
}

export async function transcribeAudioFile(params: {
  base64Audio: string;
  mimeType: string;
}): Promise<{ transcript: string }> {
  const response = await fetch('/api/subtitles/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to transcribe uploaded audio.');
  }
  return data;
}

export async function generateCueVoiceover(params: {
  text: string;
  burmeseStyle: BurmeseStyle;
  voiceName?: string;
}): Promise<{ audioWavBase64: string }> {
  const response = await fetch('/api/subtitles/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate voiceover preview.');
  }
  return data;
}

export async function generateSubtitlesFromMedia(params: {
  base64Media: string;
  mimeType: string;
  burmeseStyle: BurmeseStyle;
  targetLanguages: string[];
  movieContext: string;
  glossary: string;
  durationSeconds?: number;
}): Promise<{
  transcript: string;
  cues: Array<{
    index: number;
    startTime: string;
    endTime: string;
    speaker: string;
    sourceText: string;
    burmeseText: string;
    styleNuanceNote: string;
    otherTranslations: Array<{ language: string; text: string }>;
  }>;
}> {
  const response = await fetch('/api/subtitles/media-to-subtitles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate subtitles from uploaded media.');
  }
  return data;
}
