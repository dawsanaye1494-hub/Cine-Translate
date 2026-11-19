import React, { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { BURMESE_STYLES, BurmeseStyle, SubtitleCue } from '../types/subtitle';
import { exportToSrt, exportToVtt, triggerFileDownload } from '../utils/srtUtils';

interface ExportSubtitlesPanelProps {
  projectTitle: string;
  cues: SubtitleCue[];
  activeBurmeseStyle: BurmeseStyle;
  selectedTargetLanguages: string[];
}

export const ExportSubtitlesPanel: React.FC<ExportSubtitlesPanelProps> = ({
  projectTitle,
  cues,
  activeBurmeseStyle,
  selectedTargetLanguages,
}) => {
  const [exportFormat, setExportFormat] = useState<'srt' | 'vtt'>('srt');
  const [exportMode, setExportMode] = useState<'burmese' | 'bilingual' | 'language'>('burmese');
  const [exportStyle, setExportStyle] = useState<BurmeseStyle>(activeBurmeseStyle);
  const [exportLanguage, setExportLanguage] = useState<string>(
    selectedTargetLanguages[0] || 'Burmese (မြန်မာ)'
  );
  const [copied, setCopied] = useState(false);

  const formattedOutput = React.useMemo(() => {
    const opts = {
      mode: exportMode,
      style: exportStyle,
      languageCode: exportLanguage,
    };
    return exportFormat === 'srt' ? exportToSrt(cues, opts) : exportToVtt(cues, opts);
  }, [cues, exportFormat, exportMode, exportStyle, exportLanguage]);

  const slugTitle = projectTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const styleSlug = exportStyle.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  const filename =
    exportMode === 'language'
      ? `${slugTitle || 'recap'}_${exportLanguage.split(' ')[0].toLowerCase()}.${exportFormat}`
      : `${slugTitle || 'recap'}_burmese_${styleSlug}${exportMode === 'bilingual' ? '_bilingual' : ''}.${exportFormat}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedOutput).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    triggerFileDownload(filename, formattedOutput);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Multi-Language &amp; Burmese Subtitle Export
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Download broadcast-ready UTF-8 .SRT or WebVTT tracks for YouTube, TikTok, CapCut, Premiere Pro, or DaVinci Resolve.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={cues.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Download {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Subtitle Track Type
            </label>
            <select
              value={exportMode}
              onChange={(e) => setExportMode(e.target.value as 'burmese' | 'bilingual' | 'language')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="burmese">Burmese Only (Single Track)</option>
              <option value="bilingual">Bilingual (Burmese + Source Text)</option>
              <option value="language">Other Global Language Track</option>
            </select>
          </div>

          {exportMode !== 'language' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Burmese Stylistic Register
              </label>
              <select
                value={exportStyle}
                onChange={(e) => setExportStyle(e.target.value as BurmeseStyle)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {BURMESE_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Language
              </label>
              <select
                value={exportLanguage}
                onChange={(e) => setExportLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {selectedTargetLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Container Format
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {(['srt', 'vtt'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`py-1.5 text-xs font-semibold uppercase rounded-md transition-colors ${
                    exportFormat === fmt
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  .{fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* File Output Preview */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono-tabular">{filename}</span>
            <span className="font-mono-tabular">{cues.length} cues · UTF-8 Unicode</span>
          </div>
          <pre className="w-full max-h-[460px] overflow-auto p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono-tabular font-burmese text-slate-200 whitespace-pre-wrap leading-relaxed">
            {formattedOutput || 'No subtitle cues available to export.'}
          </pre>
        </div>
      </div>
    </section>
  );
};
