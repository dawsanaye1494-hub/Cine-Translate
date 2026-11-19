import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Loader2,
  Film,
  Languages,
  Upload,
} from 'lucide-react';
import { BurmeseStyle, SubtitleCue } from '../types/subtitle';
import { formatSecondsToDisplay, parseTimeToSeconds } from '../utils/srtUtils';

interface VideoPreviewStageProps {
  projectTitle: string;
  projectGenre: string;
  thumbnailUrl: string;
  uploadedVideoUrl: string | null;
  cues: SubtitleCue[];
  selectedCueId: string | null;
  activeBurmeseStyle: BurmeseStyle;
  previewLanguage: string;
  availableLanguages: string[];
  onPreviewLanguageChange: (lang: string) => void;
  onSelectCue: (cueId: string) => void;
  onUploadVideo: (file: File) => void;
  onPlayTts: (cue: SubtitleCue) => Promise<void>;
  ttsLoadingCueId: string | null;
}

export const VideoPreviewStage: React.FC<VideoPreviewStageProps> = ({
  projectTitle,
  projectGenre,
  thumbnailUrl,
  uploadedVideoUrl,
  cues,
  selectedCueId,
  activeBurmeseStyle,
  previewLanguage,
  availableLanguages,
  onPreviewLanguageChange,
  onSelectCue,
  onUploadVideo,
  onPlayTts,
  ttsLoadingCueId,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showBilingual, setShowBilingual] = useState(true);
  const [imgError, setImgError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalDuration = React.useMemo(() => {
    if (cues.length === 0) return 30;
    const maxEnd = Math.max(...cues.map((c) => parseTimeToSeconds(c.endTime)));
    return Math.max(maxEnd, 10);
  }, [cues]);

  useEffect(() => {
    setImgError(false);
  }, [thumbnailUrl]);

  // Sync playhead when clicking a cue in the editor table
  useEffect(() => {
    if (!selectedCueId) return;
    const found = cues.find((c) => c.id === selectedCueId);
    if (!found) return;
    const start = parseTimeToSeconds(found.startTime);
    const end = parseTimeToSeconds(found.endTime);
    if (currentTime < start || currentTime > end) {
      setCurrentTime(start + 0.1);
      if (videoRef.current && uploadedVideoUrl) {
        videoRef.current.currentTime = start + 0.1;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCueId]);

  // Simulated playback timer when no uploaded video file is active
  useEffect(() => {
    if (!isPlaying || uploadedVideoUrl) return;
    const interval = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [isPlaying, uploadedVideoUrl, totalDuration]);

  const activeCue = React.useMemo(() => {
    const byTime = cues.find((c) => {
      const s = parseTimeToSeconds(c.startTime);
      const e = parseTimeToSeconds(c.endTime);
      return currentTime >= s && currentTime <= e;
    });
    if (byTime) return byTime;
    return cues.find((c) => c.id === selectedCueId) || cues[0] || null;
  }, [cues, currentTime, selectedCueId]);

  const togglePlay = () => {
    if (uploadedVideoUrl && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  const seekTo = (sec: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, sec));
    setCurrentTime(clamped);
    if (videoRef.current && uploadedVideoUrl) {
      videoRef.current.currentTime = clamped;
    }
    const matching = cues.find((c) => {
      const s = parseTimeToSeconds(c.startTime);
      const e = parseTimeToSeconds(c.endTime);
      return clamped >= s && clamped <= e;
    });
    if (matching) {
      onSelectCue(matching.id);
    }
  };

  const stepCue = (direction: -1 | 1) => {
    if (cues.length === 0) return;
    const currentIdx = cues.findIndex((c) => c.id === (activeCue?.id ?? selectedCueId));
    const nextIdx = Math.max(0, Math.min(cues.length - 1, (currentIdx === -1 ? 0 : currentIdx) + direction));
    const target = cues[nextIdx];
    if (target) {
      onSelectCue(target.id);
      seekTo(parseTimeToSeconds(target.startTime) + 0.05);
    }
  };

  const activeSubtitleText = React.useMemo(() => {
    if (!activeCue) return '';
    if (previewLanguage === 'Burmese (မြန်မာ)') {
      return (
        activeCue.burmeseByStyle[activeBurmeseStyle] ||
        activeCue.burmeseByStyle[activeCue.activeStyle] ||
        'Translation pending — click Translate All Cues to generate.'
      );
    }
    return activeCue.otherTranslations[previewLanguage] || activeCue.sourceText;
  }, [activeCue, activeBurmeseStyle, previewLanguage]);

  const progressPercent = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Monitor Top Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-b border-slate-800 bg-slate-900/90">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-100 truncate">{projectTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            <span>{projectGenre}</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span>{activeBurmeseStyle}</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span className="font-mono-tabular">{cues.length} cues</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Preview Subtitle Track"
              value={previewLanguage}
              onChange={(e) => onPreviewLanguageChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowBilingual((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              showBilingual
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Bilingual: {showBilingual ? 'On' : 'Off'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadVideo(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            Load Video
          </button>
        </div>
      </div>

      {/* 16:9 Cinema Frame + Live Subtitle Overlay */}
      <div className="relative aspect-[21/9] min-h-[260px] max-h-[380px] w-full bg-slate-950 overflow-hidden">
        {uploadedVideoUrl ? (
          <video
            ref={videoRef}
            src={uploadedVideoUrl}
            className="w-full h-full object-contain bg-black"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => setIsPlaying(false)}
          />
        ) : !imgError ? (
          <img
            src={thumbnailUrl}
            alt={projectTitle}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-85"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-500">
            <Film className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-sm font-medium text-slate-400">{projectTitle}</span>
          </div>
        )}

        {/* Measured Contrast Scrim for Subtitle Legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

        {/* Subtitle Overlay */}
        {activeCue && (
          <div className="absolute inset-x-6 bottom-5 flex flex-col items-center text-center pointer-events-none">
            <div className="max-w-3xl bg-black/75 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/10">
              <p
                className={`text-base md:text-lg font-medium text-white tracking-wide ${
                  previewLanguage === 'Burmese (မြန်မာ)' ? 'font-burmese' : ''
                }`}
              >
                {activeSubtitleText}
              </p>
              {showBilingual && (
                <p className="text-xs md:text-sm text-slate-300 mt-1.5 leading-relaxed">
                  {activeCue.speaker}: {activeCue.sourceText}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transport & Scrubber Bar */}
      <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800 space-y-2.5">
        {/* Interactive Cue Timeline Track */}
        <div
          role="slider"
          aria-label="Subtitle Timeline Scrubber"
          aria-valuemin={0}
          aria-valuemax={Math.round(totalDuration)}
          aria-valuenow={Math.round(currentTime)}
          tabIndex={0}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            seekTo(ratio * totalDuration);
          }}
          className="relative h-6 bg-slate-900 border border-slate-800 rounded-md cursor-pointer overflow-hidden"
        >
          {/* Cue Segments */}
          {cues.map((cue) => {
            const startPct = (parseTimeToSeconds(cue.startTime) / totalDuration) * 100;
            const endPct = (parseTimeToSeconds(cue.endTime) / totalDuration) * 100;
            const widthPct = Math.max(1.5, endPct - startPct);
            const isActive = cue.id === activeCue?.id;
            return (
              <div
                key={cue.id}
                title={`#${cue.index} ${cue.startTime} - ${cue.endTime}`}
                style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                className={`absolute top-1 bottom-1 rounded-sm border transition-colors ${
                  isActive
                    ? 'bg-amber-500/35 border-amber-400/70'
                    : 'bg-slate-800/80 border-slate-700/70'
                }`}
              />
            );
          })}

          {/* Playhead */}
          <div
            style={{ left: `${progressPercent}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepCue(-1)}
              aria-label="Previous cue"
              className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => stepCue(1)}
              aria-label="Next cue"
              className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <span className="ml-2 text-xs font-mono-tabular text-slate-400">
              {formatSecondsToDisplay(currentTime)} / {formatSecondsToDisplay(totalDuration)}
            </span>
          </div>

          {activeCue && (
            <button
              type="button"
              disabled={ttsLoadingCueId === activeCue.id}
              onClick={() => onPlayTts(activeCue)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {ttsLoadingCueId === activeCue.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              )}
              Voiceover Preview (Cue #{activeCue.index})
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
