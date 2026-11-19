import { BurmeseStyle, SubtitleCue, createEmptyStyleMap } from '../types/subtitle';

export function parseTimeToSeconds(timeStr: string): number {
  const normalized = timeStr.trim().replace(',', '.');
  const parts = normalized.split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  return parseFloat(normalized) || 0;
}

export function formatSecondsToSrt(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = Math.floor(safe % 60);
  const ms = Math.round((safe - Math.floor(safe)) * 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(ms, 3)}`;
}

export function formatSecondsToDisplay(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  const tenths = Math.floor((safe % 1) * 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

export function parseSrtOrVtt(content: string, defaultStyle: BurmeseStyle): SubtitleCue[] {
  const cleaned = content
    .replace(/\r\n/g, '\n')
    .replace(/^WEBVTT\s*\n*/i, '')
    .trim();

  if (!cleaned) return [];

  const blocks = cleaned.split(/\n{2,}/);
  const cues: SubtitleCue[] = [];

  blocks.forEach((block, i) => {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const timeLineIndex = lines.findIndex((l) => l.includes('-->'));
    if (timeLineIndex === -1) return;

    const timeLine = lines[timeLineIndex];
    const [rawStart, rawEnd] = timeLine.split('-->').map((s) => s.trim().split(' ')[0]);
    const startTime = rawStart.replace('.', ',');
    const endTime = rawEnd.replace('.', ',');
    const textLines = lines.slice(timeLineIndex + 1);
    let sourceText = textLines.join(' ').trim();
    let speaker = 'Narrator';

    const speakerMatch = sourceText.match(/^([A-Za-z0-9\s._-]{2,24}):\s+(.+)$/);
    if (speakerMatch) {
      speaker = speakerMatch[1].trim();
      sourceText = speakerMatch[2].trim();
    }

    if (!sourceText) return;

    cues.push({
      id: `imported-${Date.now()}-${i + 1}`,
      index: cues.length + 1,
      startTime,
      endTime,
      speaker,
      sourceText,
      activeStyle: defaultStyle,
      burmeseByStyle: createEmptyStyleMap(defaultStyle, ''),
      otherTranslations: {},
    });
  });

  return cues;
}

export function exportToSrt(
  cues: SubtitleCue[],
  options: {
    mode: 'burmese' | 'bilingual' | 'language';
    style: BurmeseStyle;
    languageCode?: string;
  }
): string {
  return cues
    .map((cue, idx) => {
      const burmese = cue.burmeseByStyle[options.style] || cue.burmeseByStyle[cue.activeStyle] || cue.sourceText;
      let body = burmese;

      if (options.mode === 'bilingual') {
        body = `${burmese}\n${cue.sourceText}`;
      } else if (options.mode === 'language' && options.languageCode && options.languageCode !== 'Burmese (မြန်မာ)') {
        body = cue.otherTranslations[options.languageCode] || cue.sourceText;
      }

      return `${idx + 1}\n${cue.startTime.replace('.', ',')} --> ${cue.endTime.replace('.', ',')}\n${body}`;
    })
    .join('\n\n');
}

export function exportToVtt(
  cues: SubtitleCue[],
  options: {
    mode: 'burmese' | 'bilingual' | 'language';
    style: BurmeseStyle;
    languageCode?: string;
  }
): string {
  const body = cues
    .map((cue) => {
      const burmese = cue.burmeseByStyle[options.style] || cue.burmeseByStyle[cue.activeStyle] || cue.sourceText;
      let text = burmese;

      if (options.mode === 'bilingual') {
        text = `${burmese}\n${cue.sourceText}`;
      } else if (options.mode === 'language' && options.languageCode && options.languageCode !== 'Burmese (မြန်မာ)') {
        text = cue.otherTranslations[options.languageCode] || cue.sourceText;
      }

      return `${cue.startTime.replace(',', '.')} --> ${cue.endTime.replace(',', '.')}\n${text}`;
    })
    .join('\n\n');

  return `WEBVTT\n\n${body}`;
}

export function triggerFileDownload(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
