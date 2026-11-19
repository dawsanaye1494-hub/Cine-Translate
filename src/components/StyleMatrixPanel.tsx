import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Check, Volume2, Copy } from 'lucide-react';
import {
  BURMESE_STYLES,
  BurmeseStyle,
  StyleComparisonItem,
  SubtitleCue,
} from '../types/subtitle';
import { compareAllSixStyles } from '../services/subtitleApi';

interface StyleMatrixPanelProps {
  cues: SubtitleCue[];
  focusedCue: SubtitleCue | null;
  movieContext: string;
  activeBurmeseStyle: BurmeseStyle;
  onSelectGlobalStyle: (style: BurmeseStyle) => void;
  onApplyStyleToCue: (cueId: string, style: BurmeseStyle, text: string, note: string) => void;
  onPlayTextTts: (text: string, style: BurmeseStyle, key: string) => Promise<void>;
  ttsLoadingKey: string | null;
}

export const StyleMatrixPanel: React.FC<StyleMatrixPanelProps> = ({
  cues,
  focusedCue,
  movieContext,
  activeBurmeseStyle,
  onSelectGlobalStyle,
  onApplyStyleToCue,
  onPlayTextTts,
  ttsLoadingKey,
}) => {
  const [selectedCueId, setSelectedCueId] = useState<string>(focusedCue?.id || cues[0]?.id || '');
  const [customInput, setCustomInput] = useState<string>(
    focusedCue?.sourceText ||
      cues[0]?.sourceText ||
      'He smiled at the detective, knowing the real bomb was already ticking beneath the courthouse.'
  );
  const [speaker, setSpeaker] = useState<string>(focusedCue?.speaker || 'Narrator');
  const [results, setResults] = useState<StyleComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appliedStyle, setAppliedStyle] = useState<BurmeseStyle | null>(null);
  const [copiedStyle, setCopiedStyle] = useState<BurmeseStyle | null>(null);

  // Populate initial comparison from cached preset cue whenever focusedCue changes
  useEffect(() => {
    const target = cues.find((c) => c.id === (focusedCue?.id || selectedCueId)) || cues[0];
    if (!target) return;
    setSelectedCueId(target.id);
    setCustomInput(target.sourceText);
    setSpeaker(target.speaker);

    const cached: StyleComparisonItem[] = BURMESE_STYLES.map((meta) => ({
      styleName: meta.id,
      burmeseText: target.burmeseByStyle[meta.id] || '',
      keyParticlesUsed: meta.particlesExample,
      directorNote: meta.tagline,
    })).filter((item) => Boolean(item.burmeseText));

    if (cached.length === 6) {
      setResults(cached);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedCue?.id]);

  const handleSelectCueFromDropdown = (id: string) => {
    setSelectedCueId(id);
    const found = cues.find((c) => c.id === id);
    if (!found) return;
    setCustomInput(found.sourceText);
    setSpeaker(found.speaker);

    const cached: StyleComparisonItem[] = BURMESE_STYLES.map((meta) => ({
      styleName: meta.id,
      burmeseText: found.burmeseByStyle[meta.id] || '',
      keyParticlesUsed: meta.particlesExample,
      directorNote: meta.tagline,
    })).filter((item) => Boolean(item.burmeseText));

    if (cached.length > 0) {
      setResults(cached);
    }
  };

  const handleGenerateAllSix = async () => {
    if (!customInput.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await compareAllSixStyles({
        sourceText: customInput.trim(),
        movieContext,
        speaker,
      });
      setResults(data.comparisons || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to generate 6-style comparison.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (style: BurmeseStyle, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedStyle(style);
    window.setTimeout(() => setCopiedStyle(null), 1500);
  };

  const handleApply = (item: StyleComparisonItem) => {
    if (selectedCueId) {
      onApplyStyleToCue(selectedCueId, item.styleName, item.burmeseText, item.directorNote);
    }
    onSelectGlobalStyle(item.styleName);
    setAppliedStyle(item.styleName);
    window.setTimeout(() => setAppliedStyle(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Input & Cue Selector Panel */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              6-Style Burmese Tone Comparison Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Test any movie recap line across all six Burmese stylistic registers side-by-side to lock in the ideal voiceover tone.
            </p>
          </div>

          {cues.length > 0 && (
            <select
              aria-label="Pick cue from active project"
              value={selectedCueId}
              onChange={(e) => handleSelectCueFromDropdown(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 max-w-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {cues.map((c) => (
                <option key={c.id} value={c.id}>
                  #{String(c.index).padStart(2, '0')} · {c.speaker} — {c.sourceText.slice(0, 42)}...
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            placeholder="Speaker"
            className="md:w-40 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type or paste any movie recap narration or character line..."
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            disabled={isLoading || !customInput.trim()}
            onClick={handleGenerateAllSix}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Generate 6 Styles with AI
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 px-3.5 py-2.5 bg-rose-950/50 border border-rose-800/70 rounded-lg text-xs text-rose-200">
            {errorMsg}
          </div>
        )}
      </section>

      {/* 6-Card Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {BURMESE_STYLES.map((styleMeta) => {
          const item = results.find((r) => r.styleName === styleMeta.id);
          const isCurrentActive = activeBurmeseStyle === styleMeta.id;
          const ttsKey = `matrix-${styleMeta.id}`;

          return (
            <article
              key={styleMeta.id}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-colors ${
                isCurrentActive ? 'border-amber-500/60' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{styleMeta.id}</h3>
                    <p className="text-xs font-burmese text-amber-300/90 mt-0.5">
                      {styleMeta.burmeseLabel}
                    </p>
                  </div>
                  {isCurrentActive && (
                    <span className="text-xs font-medium text-amber-400 whitespace-nowrap">
                      Active
                    </span>
                  )}
                </div>

                {isLoading ? (
                  <div className="space-y-2 py-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-slate-800 rounded w-5/6" />
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                  </div>
                ) : item?.burmeseText ? (
                  <p className="text-base font-burmese text-slate-100 bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 leading-relaxed">
                    {item.burmeseText}
                  </p>
                ) : (
                  <div className="text-xs text-slate-500 bg-slate-950 border border-slate-800/80 rounded-lg p-4">
                    Click &ldquo;Generate 6 Styles with AI&rdquo; to produce a Burmese translation in{' '}
                    {styleMeta.id} register.
                  </div>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <p>
                    <span className="text-slate-300 font-medium">Particles:</span>{' '}
                    <span className="font-burmese">
                      {item?.keyParticlesUsed || styleMeta.particlesExample}
                    </span>
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    {item?.directorNote || styleMeta.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!item?.burmeseText || ttsLoadingKey === ttsKey}
                    onClick={() =>
                      item && onPlayTextTts(item.burmeseText, styleMeta.id, ttsKey)
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors disabled:opacity-40"
                  >
                    {ttsLoadingKey === ttsKey ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    Listen
                  </button>

                  <button
                    type="button"
                    disabled={!item?.burmeseText}
                    onClick={() => item && handleCopy(styleMeta.id, item.burmeseText)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors disabled:opacity-40"
                    title="Copy Burmese text"
                  >
                    {copiedStyle === styleMeta.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!item?.burmeseText}
                  onClick={() => item && handleApply(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  {appliedStyle === styleMeta.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Applied
                    </>
                  ) : (
                    'Use Style'
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
