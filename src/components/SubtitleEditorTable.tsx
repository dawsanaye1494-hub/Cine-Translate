import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Volume2,
  Loader2,
  GitCompare,
  RefreshCw,
  Check,
  Copy,
} from 'lucide-react';
import { BURMESE_STYLES, BurmeseStyle, SubtitleCue } from '../types/subtitle';

interface SubtitleEditorTableProps {
  cues: SubtitleCue[];
  selectedCueId: string | null;
  activeBurmeseStyle: BurmeseStyle;
  selectedTargetLanguages: string[];
  translatingCueId: string | null;
  isBatchTranslating: boolean;
  ttsLoadingCueId: string | null;
  onSelectCue: (cueId: string) => void;
  onUpdateCueField: (
    cueId: string,
    field: 'startTime' | 'endTime' | 'speaker' | 'sourceText',
    value: string
  ) => void;
  onUpdateBurmeseText: (cueId: string, style: BurmeseStyle, value: string) => void;
  onAddCue: () => void;
  onDeleteCue: (cueId: string) => void;
  onRetranslateSingleCue: (cue: SubtitleCue) => Promise<void>;
  onOpenCompareForCue: (cue: SubtitleCue) => void;
  onPlayTts: (cue: SubtitleCue) => Promise<void>;
}

export const SubtitleEditorTable: React.FC<SubtitleEditorTableProps> = ({
  cues,
  selectedCueId,
  activeBurmeseStyle,
  selectedTargetLanguages,
  translatingCueId,
  isBatchTranslating,
  ttsLoadingCueId,
  onSelectCue,
  onUpdateCueField,
  onUpdateBurmeseText,
  onAddCue,
  onDeleteCue,
  onRetranslateSingleCue,
  onOpenCompareForCue,
  onPlayTts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const secondaryLanguages = selectedTargetLanguages.filter((l) => l !== 'Burmese (မြန်မာ)');

  const filteredCues = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cues;
    return cues.filter((c) => {
      const burmese = c.burmeseByStyle[activeBurmeseStyle] || '';
      return (
        c.sourceText.toLowerCase().includes(q) ||
        c.speaker.toLowerCase().includes(q) ||
        burmese.toLowerCase().includes(q) ||
        c.startTime.includes(q)
      );
    });
  }, [cues, searchQuery, activeBurmeseStyle]);

  const handleCopyBurmese = (cueId: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(cueId);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-100">Subtitle Cue Sheet</h3>
          <span className="text-xs text-slate-400 font-mono-tabular">
            {filteredCues.length} of {cues.length} cues · Active Style: {activeBurmeseStyle}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cues, speakers, Burmese..."
              className="pl-8 pr-3 py-1.5 w-60 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={onAddCue}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Cue
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredCues.length === 0 ? (
        <div className="py-14 px-6 text-center">
          <p className="text-sm font-medium text-slate-300">
            {cues.length === 0
              ? 'No subtitle cues in this project yet.'
              : 'No subtitle cues match your search filter.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {cues.length === 0
              ? 'Add a cue manually or import an SRT file / recap script from the Script Import tab.'
              : 'Try clearing the search query to view all timed cues.'}
          </p>
          {cues.length === 0 && (
            <button
              type="button"
              onClick={onAddCue}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Cue
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {filteredCues.map((cue) => {
            const isSelected = cue.id === selectedCueId;
            const burmeseValue = cue.burmeseByStyle[activeBurmeseStyle] || '';
            const isTranslatingThis = translatingCueId === cue.id || isBatchTranslating;
            const filledStyleCount = BURMESE_STYLES.filter(
              (s) => Boolean(cue.burmeseByStyle[s.id]?.trim())
            ).length;

            return (
              <div
                key={cue.id}
                onClick={() => onSelectCue(cue.id)}
                className={`p-4 md:p-5 transition-colors cursor-pointer ${
                  isSelected ? 'bg-slate-800/45' : 'hover:bg-slate-800/20'
                }`}
              >
                {/* Cue Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold font-mono-tabular text-amber-400">
                      #{String(cue.index).padStart(2, '0')}
                    </span>

                    <div className="flex items-center gap-1.5 font-mono-tabular text-xs text-slate-300">
                      <input
                        aria-label={`Start time for cue ${cue.index}`}
                        value={cue.startTime}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateCueField(cue.id, 'startTime', e.target.value)}
                        className="w-24 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-600">→</span>
                      <input
                        aria-label={`End time for cue ${cue.index}`}
                        value={cue.endTime}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateCueField(cue.id, 'endTime', e.target.value)}
                        className="w-24 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <input
                      aria-label={`Speaker for cue ${cue.index}`}
                      value={cue.speaker}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateCueField(cue.id, 'speaker', e.target.value)}
                      className="w-32 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-medium text-slate-300 focus:outline-none focus:border-amber-500"
                      placeholder="Speaker"
                    />

                    <span className="text-xs text-slate-500 font-mono-tabular">
                      {filledStyleCount}/6 styles cached
                    </span>
                  </div>

                  {/* Cue Actions */}
                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={isTranslatingThis}
                      onClick={() => onRetranslateSingleCue(cue)}
                      title={`Translate cue into ${activeBurmeseStyle}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTranslatingThis ? 'animate-spin text-amber-400' : ''}`} />
                      Translate
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenCompareForCue(cue)}
                      title="Compare all 6 Burmese styles for this line"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-amber-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors whitespace-nowrap"
                    >
                      <GitCompare className="w-3 h-3" />
                      6 Styles
                    </button>

                    <button
                      type="button"
                      disabled={ttsLoadingCueId === cue.id || !burmeseValue}
                      onClick={() => onPlayTts(cue)}
                      title="Listen to Burmese TTS voiceover"
                      className="p-1.5 text-slate-400 hover:text-amber-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors disabled:opacity-40"
                    >
                      {ttsLoadingCueId === cue.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyBurmese(cue.id, burmeseValue)}
                      title="Copy Burmese line"
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
                    >
                      {copiedId === cue.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteCue(cue.id)}
                      title="Delete cue"
                      className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dual-Column Source & Burmese Translation */}
                <div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Source Script ({cue.speaker})
                    </label>
                    <textarea
                      rows={2}
                      value={cue.sourceText}
                      onChange={(e) => onUpdateCueField(cue.id, 'sourceText', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500 resize-y"
                      placeholder="Enter movie recap narration or dialogue line..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-amber-300/90">
                        Burmese Output · {activeBurmeseStyle}
                      </label>
                      <span className="text-xs text-slate-500 font-mono-tabular">
                        {burmeseValue.length} chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={burmeseValue}
                      onChange={(e) => onUpdateBurmeseText(cue.id, activeBurmeseStyle, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-burmese text-slate-100 focus:outline-none focus:border-amber-500 resize-y"
                      placeholder="Click Translate to generate Burmese subtitles in this style..."
                    />
                  </div>
                </div>

                {/* Nuance Note + Secondary Languages */}
                {(cue.styleNuanceNote || secondaryLanguages.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-slate-800/70 space-y-2">
                    {cue.styleNuanceNote && (
                      <p className="text-xs text-slate-400">
                        <span className="text-slate-300 font-medium">Style Nuance:</span>{' '}
                        {cue.styleNuanceNote}
                        {cue.romanizedPronunciation && (
                          <>
                            <span aria-hidden="true" className="mx-2 text-slate-600">·</span>
                            <span className="text-slate-500 italic">{cue.romanizedPronunciation}</span>
                          </>
                        )}
                      </p>
                    )}

                    {secondaryLanguages.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                        {secondaryLanguages.map((lang) => (
                          <div
                            key={lang}
                            className="text-xs text-slate-300 bg-slate-950/70 border border-slate-800/80 rounded-md px-3 py-2"
                          >
                            <span className="font-medium text-slate-400 mr-2">{lang}:</span>
                            <span>
                              {cue.otherTranslations[lang] || (
                                <span className="text-slate-500 italic">
                                  Pending — run Translate All Cues
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
