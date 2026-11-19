import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ttsAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1beta',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const BURMESE_STYLE_GUIDES: Record<string, string> = {
  'Polite & Natural': `
- Tone: Warm, respectful, smooth everyday spoken Burmese suitable for family-friendly and general audience movie recaps.
- Pronouns & Particles: Use polite particles such as "ခင်ဗျာ/ရှင့်", sentence-final "ပါတယ်", "ပါပြီ", "နော်", and respectful pronouns ("ကျွန်တော်/ကျွန်မ", "သူတို့").
- Flow: Avoid stiff literary book-Burmese ("သည်", "၏", "၌"). Keep phrasing conversational yet courteous and clear for voiceover narration.`,

  'Diplomatic & Soft': `
- Tone: Gentle, tactful, conflict-deescalating, poised, and courtly Burmese suitable for royal dramas, negotiations, romance, and emotional reconciliations.
- Pronouns & Particles: Use softened hedging and courteous requests ("မေတ္တာရပ်ခံပါတယ်", "ဖြစ်နိုင်မယ်ဆိုရင်", "နားလည်ပေးနိုင်မယ်လို့ မျှော်လင့်ပါတယ်", "ပါရစေ").
- Flow: Cushion blunt statements into graceful, Indirect Burmese phrasing with refined emotional resonance.`,

  'Casual Spoken': `
- Tone: Fast-paced, relatable, street-smart modern Burmese recap narrator voice (like top YouTube/TikTok movie recap channels).
- Pronouns & Particles: Use natural colloquial particles ("ပေါ့", "ဗျာ", "ဟာ", "ကွာ", "တဲ့", "လေ"), contractions, and vivid everyday expressions.
- Flow: Punchy, engaging, rhythmic, and effortless to listen to at 1.2x recap speed.`,

  'Dramatic & Sharp': `
- Tone: High-stakes, suspenseful, cinematic thriller/action recap style that hooks the viewer immediately.
- Pronouns & Particles: Use emphatic intensifiers ("လုံးဝ", "ချက်ချင်းပဲ", "မထင်မှတ်ထားဘဲ", "သွေးအေးအေးနဲ့"), sharp verbs, and cliffhanger cadence.
- Flow: Short, hard-hitting clauses with dramatic pauses and visceral emotional impact.`,

  'Cold & Direct': `
- Tone: Detached, clinical, icy, authoritative, no-nonsense Burmese suitable for crime procedurals, sci-fi, assassins, or ruthless antagonists.
- Pronouns & Particles: Strip away softening particles. Use crisp, clipped endings ("ပဲ", "တယ်", "မယ်", "မရှိဘူး").
- Flow: Zero filler words, razor-sharp precision, matter-of-fact delivery.`,

  'Natural & Idiomatic': `
- Tone: Culturally localized Burmese that replaces foreign idioms with authentic Myanmar proverbs, metaphors, and natural cultural equivalents.
- Pronouns & Particles: Rich idiomatic Burmese compounds (e.g., "အသက်ရှူမှားလောက်အောင်", "နောက်ကျောကို ဓားနဲ့ထိုး", "မျက်လုံးပြူးမျက်ဆံပြူး", "အကြံပက်စက်").
- Flow: Reads as if the story was originally written by a native Burmese screenwriter rather than translated line-by-line.`,
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '45mb' }));

  // 1. Batch Translate Subtitles into Burmese Style + Optional Secondary Languages
  app.post('/api/subtitles/translate', async (req, res) => {
    try {
      const {
        cues,
        burmeseStyle = 'Dramatic & Sharp',
        targetLanguages = ['Burmese (မြန်မာ)'],
        movieContext = 'Cinematic movie recap narration and key dialogue',
        glossary = '',
      } = req.body;

      if (!Array.isArray(cues) || cues.length === 0) {
        return res.status(400).json({ error: 'Please provide at least one subtitle cue to translate.' });
      }

      const styleGuide = BURMESE_STYLE_GUIDES[burmeseStyle] || BURMESE_STYLE_GUIDES['Polite & Natural'];

      const prompt = `You are an elite Myanmar Movie Recap Localization Director and Multi-Language Subtitle Translator.
Translate the following movie recap subtitle cues accurately while preserving timecode pacing and character constraints.

MOVIE CONTEXT / GENRE:
${movieContext}

Character / Terminology Glossary:
${glossary || 'Use standard natural transliteration for proper names.'}

SELECTED BURMESE STYLE: "${burmeseStyle}"
BURMESE STYLE RULES:
${styleGuide}

CRITICAL RULES FOR BURMESE:
1. ALWAYS use authentic spoken Burmese (အပြောစကား) suitable for movie recap voiceovers and subtitles, NEVER stiff literary prose (အရေးစကား like သည်, ၏, ၌, ၎င်း) unless quoting an ancient decree.
2. Ensure the Burmese phrasing strictly reflects the "${burmeseStyle}" tone so the difference in register, particles, and vocabulary is unmistakable.
3. Also provide translations for these requested languages: ${targetLanguages.join(', ')}.

INPUT SUBTITLE CUES (JSON):
${JSON.stringify(
  cues.map((c: { id: string; index: number; startTime: string; endTime: string; speaker?: string; sourceText: string }) => ({
    id: c.id,
    index: c.index,
    startTime: c.startTime,
    endTime: c.endTime,
    speaker: c.speaker || 'Narrator',
    sourceText: c.sourceText,
  })),
  null,
  2
)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are an expert Burmese & multilingual movie recap subtitle localization engine. Return strictly valid JSON matching the requested schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedCues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    burmeseText: {
                      type: Type.STRING,
                      description: 'The Burmese translation strictly written in the requested style register.',
                    },
                    romanizedPronunciation: {
                      type: Type.STRING,
                      description: 'Brief phonetic reading guide for voiceover narrators.',
                    },
                    styleNuanceNote: {
                      type: Type.STRING,
                      description: '1-line explanation of key Burmese particles or idioms chosen for this style.',
                    },
                    otherTranslations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          language: { type: Type.STRING },
                          text: { type: Type.STRING },
                        },
                        required: ['language', 'text'],
                      },
                    },
                  },
                  required: ['id', 'burmeseText', 'romanizedPronunciation', 'styleNuanceNote', 'otherTranslations'],
                },
              },
            },
            required: ['translatedCues'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (error: unknown) {
      console.error('Error in /api/subtitles/translate:', error);
      const message = error instanceof Error ? error.message : 'Failed to translate subtitle cues.';
      return res.status(500).json({ error: message });
    }
  });

  // 2. Compare All 6 Burmese Styles on a Single Cue or Paragraph
  app.post('/api/subtitles/compare-styles', async (req, res) => {
    try {
      const { sourceText, movieContext = 'Movie recap narration and dialogue', speaker = 'Narrator' } = req.body;

      if (!sourceText || typeof sourceText !== 'string') {
        return res.status(400).json({ error: 'sourceText is required for 6-style comparison.' });
      }

      const styleDescriptions = Object.entries(BURMESE_STYLE_GUIDES)
        .map(([name, desc]) => `### ${name}\n${desc}`)
        .join('\n\n');

      const prompt = `Translate the following movie recap line into ALL 6 distinct Burmese stylistic registers so the editor can compare them side-by-side and pick the best fit.

SOURCE LINE (${speaker}):
"${sourceText}"

MOVIE CONTEXT:
${movieContext}

THE 6 REQUIRED BURMESE STYLES:
${styleDescriptions}

Make sure each of the 6 Burmese outputs is authentically differentiated in particles, sentence endings, vocabulary, and emotional intensity.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are a master Burmese screenwriter and localization director. Return strictly valid JSON containing all 6 Burmese styles.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              comparisons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    styleName: {
                      type: Type.STRING,
                      description:
                        'One of: Polite & Natural, Diplomatic & Soft, Casual Spoken, Dramatic & Sharp, Cold & Direct, Natural & Idiomatic',
                    },
                    burmeseText: { type: Type.STRING },
                    keyParticlesUsed: {
                      type: Type.STRING,
                      description: 'Specific Burmese particles or idioms used (e.g. ပါတယ် / ပေါ့ဗျာ / လုံးဝ).',
                    },
                    directorNote: {
                      type: Type.STRING,
                      description: 'Why this version works for specific scenes or audiences.',
                    },
                  },
                  required: ['styleName', 'burmeseText', 'keyParticlesUsed', 'directorNote'],
                },
              },
            },
            required: ['comparisons'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (error: unknown) {
      console.error('Error in /api/subtitles/compare-styles:', error);
      const message = error instanceof Error ? error.message : 'Failed to compare Burmese styles.';
      return res.status(500).json({ error: message });
    }
  });

  // 3. Generate Timed Recap Subtitles from Raw Script or Story Synopsis
  app.post('/api/subtitles/segment-script', async (req, res) => {
    try {
      const { rawScript, burmeseStyle = 'Dramatic & Sharp', targetDurationSeconds = 45 } = req.body;

      if (!rawScript || typeof rawScript !== 'string') {
        return res.status(400).json({ error: 'Please provide a raw recap script or plot summary.' });
      }

      const styleGuide = BURMESE_STYLE_GUIDES[burmeseStyle] || BURMESE_STYLE_GUIDES['Dramatic & Sharp'];

      const prompt = `Break down the following movie recap script or synopsis into timed subtitle cues (between 5 and 10 cues covering roughly ${targetDurationSeconds} seconds), and translate each cue into Burmese using the "${burmeseStyle}" style.

BURMESE STYLE GUIDE:
${styleGuide}

RAW RECAP SCRIPT / SYNOPSIS:
${rawScript}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You segment raw movie recap scripts into tightly paced SRT timecode cues and translate them into Burmese.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    index: { type: Type.INTEGER },
                    startTime: {
                      type: Type.STRING,
                      description: 'SRT timestamp format HH:MM:SS,mmm e.g. 00:00:04,500',
                    },
                    endTime: {
                      type: Type.STRING,
                      description: 'SRT timestamp format HH:MM:SS,mmm e.g. 00:00:09,000',
                    },
                    speaker: { type: Type.STRING },
                    sourceText: { type: Type.STRING },
                    burmeseText: { type: Type.STRING },
                    styleNuanceNote: { type: Type.STRING },
                  },
                  required: ['index', 'startTime', 'endTime', 'speaker', 'sourceText', 'burmeseText', 'styleNuanceNote'],
                },
              },
            },
            required: ['cues'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (error: unknown) {
      console.error('Error in /api/subtitles/segment-script:', error);
      const message = error instanceof Error ? error.message : 'Failed to segment and translate recap script.';
      return res.status(500).json({ error: message });
    }
  });

  // 4. Transcribe Audio / Video Voiceover Track into Subtitle Cues
  app.post('/api/subtitles/transcribe', async (req, res) => {
    try {
      const { base64Audio, mimeType = 'audio/mp3' } = req.body;
      if (!base64Audio) {
        return res.status(400).json({ error: 'base64Audio data is required.' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
            {
              text: 'Transcribe this movie recap audio clip. Break it into concise sentences suitable for subtitle cues.',
            },
          ],
        },
      });

      return res.json({ transcript: response.text ?? '' });
    } catch (error: unknown) {
      console.error('Error in /api/subtitles/transcribe:', error);
      const message = error instanceof Error ? error.message : 'Failed to transcribe audio.';
      return res.status(500).json({ error: message });
    }
  });

  // 4b. Multimodal Voice or Video -> Timed Burmese & Multi-Language Subtitles
  app.post('/api/subtitles/media-to-subtitles', async (req, res) => {
    try {
      const {
        base64Media,
        mimeType = 'audio/wav',
        burmeseStyle = 'Dramatic & Sharp',
        targetLanguages = ['Burmese (မြန်မာ)'],
        movieContext = 'Cinematic movie recap narration and dialogue',
        glossary = '',
        durationSeconds,
      } = req.body;

      if (!base64Media || typeof base64Media !== 'string') {
        return res.status(400).json({ error: 'Media payload (base64Media) is required.' });
      }

      const styleGuide = BURMESE_STYLE_GUIDES[burmeseStyle] || BURMESE_STYLE_GUIDES['Dramatic & Sharp'];
      const isVideo = mimeType.startsWith('video/');

      const prompt = `Analyze this uploaded movie recap ${isVideo ? 'video' : 'voice audio'} clip.
1. Accurately transcribe all spoken narration and character dialogue.
2. Segment the transcript into well-paced SRT subtitle cues matching the spoken timing${
        durationSeconds ? ` (clip duration is approximately ${durationSeconds} seconds)` : ''
      }.
3. Translate every cue into authentic spoken Burmese strictly following the "${burmeseStyle}" style guide below.
4. Also provide parallel translations for these requested languages: ${targetLanguages.join(', ')}.

MOVIE CONTEXT:
${movieContext}

CHARACTER / TERM GLOSSARY:
${glossary || 'Use natural Burmese transliteration for names.'}

SELECTED BURMESE STYLE: "${burmeseStyle}"
${styleGuide}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Media,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are an elite multimodal movie recap transcription and Burmese localization engine. Return strictly valid JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: {
                type: Type.STRING,
                description: 'Full clean transcript of the spoken audio/video.',
              },
              cues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    index: { type: Type.INTEGER },
                    startTime: {
                      type: Type.STRING,
                      description: 'SRT timestamp format HH:MM:SS,mmm',
                    },
                    endTime: {
                      type: Type.STRING,
                      description: 'SRT timestamp format HH:MM:SS,mmm',
                    },
                    speaker: { type: Type.STRING },
                    sourceText: { type: Type.STRING },
                    burmeseText: { type: Type.STRING },
                    styleNuanceNote: { type: Type.STRING },
                    otherTranslations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          language: { type: Type.STRING },
                          text: { type: Type.STRING },
                        },
                        required: ['language', 'text'],
                      },
                    },
                  },
                  required: [
                    'index',
                    'startTime',
                    'endTime',
                    'speaker',
                    'sourceText',
                    'burmeseText',
                    'styleNuanceNote',
                    'otherTranslations',
                  ],
                },
              },
            },
            required: ['transcript', 'cues'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (error: unknown) {
      console.error('Error in /api/subtitles/media-to-subtitles:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to generate subtitles from uploaded media.';
      return res.status(500).json({ error: message });
    }
  });

  // 5. Generate Voiceover Preview (TTS) for a Subtitle Cue
  app.post('/api/subtitles/tts', async (req, res) => {
    try {
      const { text, burmeseStyle = 'Dramatic & Sharp', voiceName = 'Kore' } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required for TTS voiceover preview.' });
      }

      const stylePromptMap: Record<string, string> = {
        'Polite & Natural': 'Warm, polite, clear movie narrator',
        'Diplomatic & Soft': 'Gentle, soft, poised diplomatic narrator',
        'Casual Spoken': 'Energetic, conversational YouTube movie recap host',
        'Dramatic & Sharp': 'Suspenseful, intense cinematic movie trailer narrator',
        'Cold & Direct': 'Calm, detached, ice-cold clinical narrator',
        'Natural & Idiomatic': 'Expressive, culturally vivid storyteller',
      };

      const response = await ttsAi.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text,
                speechMetadata: {
                  style: stylePromptMap[burmeseStyle] || 'Clear movie recap narrator',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        return res.status(500).json({ error: 'No audio data returned by TTS model.' });
      }

      return res.json({ audioWavBase64: base64Audio });
    } catch (error: unknown) {
      console.error('Error in /api/subtitles/tts:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate TTS audio preview.';
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
