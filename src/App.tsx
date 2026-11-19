import React, { useRef, useState } from 'react';
import {
  Languages,
  Loader2,
  Check,
  AlertCircle,
  Menu,
  X,
  Upload,
} from 'lucide-react';
import {
  BURMESE_STYLES,
  BurmeseStyle,
  SAMPLE_PROJECTS,
  SubtitleCue,
  TARGET_LANGUAGES,
  createEmptyStyleMap,
} from './types/subtitle';
import { formatSecondsToSrt, parseTimeToSeconds } from './utils/srtUtils';
import { generateCueVoiceover, translateCuesBatch } from './services/subtitleApi';
import { VideoPreviewStage } from './components/VideoPreviewStage';
import { SubtitleEditorTable } from './components/SubtitleEditorTable';
import { StyleMatrixPanel } from './components/StyleMatrixPanel';
import { ImportMediaPanel } from './components/ImportMediaPanel';
import { ExportSubtitlesPanel } from './components/ExportSubtitlesPanel';

type WorkspaceView = 'workbench' | 'matrix' | 'import' | 'export';

export default function App() {
  const initialProject = SAMPLE_PROJECTS[0];

  const [activeView, setActiveView] = useState<WorkspaceView>('workbench');
  const [activeProjectId, setActiveProjectId] = useState<string>(initialProject.id);
  const [projectTitle, setProjectTitle] = useState<string>(initialProject.title);
  const [projectGenre, setProjectGenre] = useState<string>(initialProject.genre);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(initialProject.thumbnailUrl);
  const [movieContext, setMovieContext] = useState<string>(initialProject.movieContext);
  const [glossary, setGlossary] = useState<string>(initialProject.glossary);
  const [cues, setCues] = useState<SubtitleCue[]>(initialProject.cues);
  const [selectedCueId, setSelectedCueId] = useState<string | null>(initialProject.cues[0]?.id || null);

  const [activeBurmeseStyle, setActiveBurmeseStyle] = useState<BurmeseStyle>(
    initialProject.recommendedStyle
  );
  const [selectedTargetLanguages, setSelectedTargetLanguages] = useState<string[]>([
    'Burmese (မြန်မာ)',
    'English',
    'Thai (ไทย)',
  ]);
  const [previewLanguage, setPreviewLanguage] = useState<string>('Burmese (မြန်မာ)');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  const [isBatchTranslating, setIsBatchTranslating] = useState(false);
  const [translatingCueId, setTranslatingCueId] = useState<string | null>(null);
  const [ttsLoadingKey, setTtsLoadingKey] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setBannerMessage({ type, text });
    window.setTimeout(() => {
      setBannerMessage((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = SAMPLE_PROJECTS.find((p) => p.id === presetId);
    if (!preset) return;
    setActiveProjectId(preset.id);
    setProjectTitle(preset.title);
    setProjectGenre(preset.genre);
    setThumbnailUrl(preset.thumbnailUrl);
    setMovieContext(preset.movieContext);
    setGlossary(preset.glossary);
    setCues(preset.cues);
    setSelectedCueId(preset.cues[0]?.id || null);
    setActiveBurmeseStyle(preset.recommendedStyle);
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
      setUploadedVideoUrl(null);
    }
    setMobileSidebarOpen(false);
  };

  const handleToggleTargetLanguage = (langCode: string) => {
    if (langCode === 'Burmese (မြန်မာ)') return; // Burmese is always primary
    setSelectedTargetLanguages((prev) => {
      const exists = prev.includes(langCode);
      const updated = exists ? prev.filter((l) => l !== langCode) : [...prev, langCode];
      if (exists && previewLanguage === langCode) {
        setPreviewLanguage('Burmese (မြန်မာ)');
      }
      return updated;
    });
  };

  const handleUploadVideo = (file: File, stayOnCurrentTab = false) => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setUploadedVideoUrl(nextUrl);
    setProjectTitle(file.name.replace(/\.[^/.]+$/, ''));
    if (!stayOnCurrentTab) {
      setActiveView('workbench');
    }
  };

  const handleTranslateAllCues = async () => {
    if (cues.length === 0) {
      showToast('error', 'Add or import at least one subtitle cue before translating.');
      return;
    }

    setIsBatchTranslating(true);
    setBannerMessage(null);
    try {
      const data = await translateCuesBatch({
        cues,
        burmeseStyle: activeBurmeseStyle,
        targetLanguages: selectedTargetLanguages,
        movieContext,
        glossary,
      });

      const responseMap = new Map(data.translatedCues.map((t) => [t.id, t]));

      setCues((prev) =>
        prev.map((cue) => {
          const translated = responseMap.get(cue.id);
          if (!translated) return cue;

          const updatedOthers = { ...cue.otherTranslations };
          for (const item of translated.otherTranslations || []) {
            updatedOthers[item.language] = item.text;
          }

          return {
            ...cue,
            activeStyle: activeBurmeseStyle,
            burmeseByStyle: {
              ...cue.burmeseByStyle,
              [activeBurmeseStyle]: translated.burmeseText,
            },
            romanizedPronunciation: translated.romanizedPronunciation,
            styleNuanceNote: translated.styleNuanceNote,
            otherTranslations: updatedOthers,
          };
        })
      );

      showToast(
        'success',
        `Translated ${cues.length} cues into ${activeBurmeseStyle} Burmese and ${selectedTargetLanguages.length} language track(s).`
      );
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Batch translation failed.');
    } finally {
      setIsBatchTranslating(false);
    }
  };

  const handleRetranslateSingleCue = async (cue: SubtitleCue) => {
    setTranslatingCueId(cue.id);
    try {
      const data = await translateCuesBatch({
        cues: [cue],
        burmeseStyle: activeBurmeseStyle,
        targetLanguages: selectedTargetLanguages,
        movieContext,
        glossary,
      });

      const translated = data.translatedCues[0];
      if (!translated) throw new Error('No translation returned for this cue.');

      setCues((prev) =>
        prev.map((item) => {
          if (item.id !== cue.id) return item;
          const updatedOthers = { ...item.otherTranslations };
          for (const entry of translated.otherTranslations || []) {
            updatedOthers[entry.language] = entry.text;
          }
          return {
            ...item,
            activeStyle: activeBurmeseStyle,
            burmeseByStyle: {
              ...item.burmeseByStyle,
              [activeBurmeseStyle]: translated.burmeseText,
            },
            romanizedPronunciation: translated.romanizedPronunciation,
            styleNuanceNote: translated.styleNuanceNote,
            otherTranslations: updatedOthers,
          };
        })
      );
      showToast('success', `Updated Cue #${cue.index} in ${activeBurmeseStyle} style.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to translate cue.');
    } finally {
      setTranslatingCueId(null);
    }
  };

  const handlePlayTextTts = async (text: string, style: BurmeseStyle, loadingKey: string) => {
    if (!text.trim()) return;
    setTtsLoadingKey(loadingKey);
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const { audioWavBase64 } = await generateCueVoiceover({
        text,
        burmeseStyle: style,
      });
      const audio = new Audio(`data:audio/wav;base64,${audioWavBase64}`);
      audioPlayerRef.current = audio;
      await audio.play();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Voiceover preview failed.');
    } finally {
      setTtsLoadingKey(null);
    }
  };

  const handlePlayCueTts = async (cue: SubtitleCue) => {
    const text = cue.burmeseByStyle[activeBurmeseStyle] || cue.burmeseByStyle[cue.activeStyle] || cue.sourceText;
    await handlePlayTextTts(text, activeBurmeseStyle, cue.id);
  };

  const handleUpdateCueField = (
    cueId: string,
    field: 'startTime' | 'endTime' | 'speaker' | 'sourceText',
    value: string
  ) => {
    setCues((prev) => prev.map((c) => (c.id === cueId ? { ...c, [field]: value } : c)));
  };

  const handleUpdateBurmeseText = (cueId: string, style: BurmeseStyle, value: string) => {
    setCues((prev) =>
      prev.map((c) =>
        c.id === cueId
          ? {
              ...c,
              burmeseByStyle: {
                ...c.burmeseByStyle,
                [style]: value,
              },
            }
          : c
      )
    );
  };

  const handleAddCue = () => {
    const lastCue = cues[cues.length - 1];
    const startSec = lastCue ? parseTimeToSeconds(lastCue.endTime) : 0;
    const endSec = startSec + 5;
    const newCue: SubtitleCue = {
      id: `cue-${Date.now()}`,
      index: cues.length + 1,
      startTime: formatSecondsToSrt(startSec),
      endTime: formatSecondsToSrt(endSec),
      speaker: 'Narrator',
      sourceText: '',
      activeStyle: activeBurmeseStyle,
      burmeseByStyle: createEmptyStyleMap(activeBurmeseStyle, ''),
      otherTranslations: {},
    };
    setCues((prev) => [...prev, newCue]);
    setSelectedCueId(newCue.id);
  };

  const handleDeleteCue = (cueId: string) => {
    setCues((prev) => {
      const remaining = prev
        .filter((c) => c.id !== cueId)
        .map((c, idx) => ({ ...c, index: idx + 1 }));
      if (selectedCueId === cueId) {
        setSelectedCueId(remaining[0]?.id || null);
      }
      return remaining;
    });
  };

  const handleImportCues = (importedCues: SubtitleCue[], title?: string) => {
    setActiveProjectId('custom');
    if (title) setProjectTitle(title);
    setProjectGenre('Imported Media Recap');
    setCues(importedCues);
    setSelectedCueId(importedCues[0]?.id || null);
    setActiveView('workbench');
    showToast('success', `Imported ${importedCues.length} timed subtitle cues into the Workbench.`);
  };

  const handleApplyStyleFromMatrix = (
    cueId: string,
    style: BurmeseStyle,
    text: string,
    note: string
  ) => {
    setCues((prev) =>
      prev.map((c) =>
        c.id === cueId
          ? {
              ...c,
              activeStyle: style,
              styleNuanceNote: note,
              burmeseByStyle: {
                ...c.burmeseByStyle,
                [style]: text,
              },
            }
          : c
      )
    );
  };

  const focusedCue = cues.find((c) => c.id === selectedCueId) || cues[0] || null;
  const activeStyleMeta = BURMESE_STYLES.find((s) => s.id === activeBurmeseStyle) || BURMESE_STYLES[0];

  const navItems: Array<{ id: WorkspaceView; label: string }> = [
    { id: 'workbench', label: 'Workbench' },
    { id: 'matrix', label: '6-Style Matrix' },
    { id: 'import', label: 'Import Media' },
    { id: 'export', label: 'Export' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 h-16 px-4 md:px-6 bg-slate-950/95 backdrop-blur border-b border-slate-800 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            aria-label="Toggle workspace sidebar"
            onClick={() => setMobileSidebarOpen((v) => !v)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <a
            href="#workbench"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('workbench');
            }}
            className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
          >
            CineRecap Studio
          </a>
        </div>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-amber-300 border-amber-400'
                    : 'text-slate-400 border-transparent hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            disabled={isBatchTranslating}
            onClick={handleTranslateAllCues}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {isBatchTranslating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Languages className="w-3.5 h-3.5" />
            )}
            {isBatchTranslating ? 'Translating...' : 'Translate All Cues'}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Strip */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveView(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeView === item.id
                ? 'bg-slate-800 text-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Canvas: Left Studio Sidebar + Main Viewport */}
      <div className="flex-1 flex relative">
        {/* Left Studio Sidebar */}
        <aside
          className={`${
            mobileSidebarOpen ? 'fixed inset-y-16 left-0 z-20 block' : 'hidden'
          } lg:block w-72 shrink-0 bg-slate-900/70 border-r border-slate-800 overflow-y-auto p-5 space-y-6`}
        >
          {/* 1. Burmese Style Register Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-semibold text-slate-200">
                Burmese Output Style (6)
              </h2>
              <button
                type="button"
                onClick={() => setActiveView('matrix')}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Compare all
              </button>
            </div>

            <div className="space-y-1.5">
              {BURMESE_STYLES.map((style) => {
                const isSelected = activeBurmeseStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setActiveBurmeseStyle(style.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-amber-500/12 border-amber-500/50 text-slate-100'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{style.id}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-xs font-burmese text-slate-400 mt-0.5 truncate">
                      {style.burmeseLabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* 2. Movie Recap Demo Projects */}
          <div>
            <h2 className="text-xs font-semibold text-slate-200 mb-2.5">
              Recap Movie Projects
            </h2>
            <div className="space-y-2">
              {SAMPLE_PROJECTS.map((project) => {
                const isActive = activeProjectId === project.id;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => handleLoadPreset(project.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                      isActive
                        ? 'bg-slate-800/70 border-slate-700 text-white'
                        : 'bg-slate-950/50 border-slate-800/70 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <p className="text-xs font-medium truncate">{project.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {project.genre} · {project.durationLabel}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveView('import');
                setMobileSidebarOpen(false);
              }}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Voice, Text or Video
            </button>
          </div>

          <hr className="border-slate-800" />

          {/* 3. Global Secondary Subtitle Languages */}
          <div>
            <h2 className="text-xs font-semibold text-slate-200 mb-1">
              Multi-Language Tracks
            </h2>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Generate parallel subtitles for global audiences alongside Burmese.
            </p>
            <div className="space-y-1.5">
              {TARGET_LANGUAGES.map((lang) => {
                const isChecked = selectedTargetLanguages.includes(lang.code);
                const isPrimary = lang.code === 'Burmese (မြန်မာ)';
                return (
                  <label
                    key={lang.code}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-slate-800/60 text-slate-100'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isPrimary}
                        onChange={() => handleToggleTargetLanguage(lang.code)}
                        className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-amber-500"
                      />
                      <span className="truncate">{lang.label}</span>
                    </span>
                    {isPrimary && (
                      <span className="text-[11px] text-amber-400 shrink-0">Primary</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Studio Viewport */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-7 max-w-[1280px] mx-auto w-full space-y-6">
          {/* Active Feedback Banner */}
          {bannerMessage && (
            <div
              role="status"
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-xs font-medium ${
                bannerMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-800 text-rose-200'
              }`}
            >
              <span className="flex items-center gap-2">
                {bannerMessage.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {bannerMessage.text}
              </span>
              <button
                type="button"
                onClick={() => setBannerMessage(null)}
                className="text-current opacity-75 hover:opacity-100"
                aria-label="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Contextual Style Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-1 border-b border-slate-800/80">
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-slate-100">
                {activeView === 'workbench' && 'Recap Subtitle Localization Workbench'}
                {activeView === 'matrix' && '6-Style Burmese Tone Matrix'}
                {activeView === 'import' && 'Import Media — Voice, Text & Video'}
                {activeView === 'export' && 'Export Multilingual Subtitles'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                <span>Active Burmese Register: </span>
                <span className="text-amber-300 font-medium">{activeStyleMeta.id}</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span className="font-burmese text-slate-300">{activeStyleMeta.burmeseLabel}</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>{activeStyleMeta.idealGenres}</span>
              </p>
            </div>

            <div className="text-xs text-slate-400 font-mono-tabular">
              {cues.length} Cues · {selectedTargetLanguages.length} Languages
            </div>
          </div>

          {/* Active Workspace View */}
          {activeView === 'workbench' && (
            <>
              <VideoPreviewStage
                projectTitle={projectTitle}
                projectGenre={projectGenre}
                thumbnailUrl={thumbnailUrl}
                uploadedVideoUrl={uploadedVideoUrl}
                cues={cues}
                selectedCueId={selectedCueId}
                activeBurmeseStyle={activeBurmeseStyle}
                previewLanguage={previewLanguage}
                availableLanguages={selectedTargetLanguages}
                onPreviewLanguageChange={setPreviewLanguage}
                onSelectCue={setSelectedCueId}
                onUploadVideo={handleUploadVideo}
                onPlayTts={handlePlayCueTts}
                ttsLoadingCueId={ttsLoadingKey}
              />

              <SubtitleEditorTable
                cues={cues}
                selectedCueId={selectedCueId}
                activeBurmeseStyle={activeBurmeseStyle}
                selectedTargetLanguages={selectedTargetLanguages}
                translatingCueId={translatingCueId}
                isBatchTranslating={isBatchTranslating}
                ttsLoadingCueId={ttsLoadingKey}
                onSelectCue={setSelectedCueId}
                onUpdateCueField={handleUpdateCueField}
                onUpdateBurmeseText={handleUpdateBurmeseText}
                onAddCue={handleAddCue}
                onDeleteCue={handleDeleteCue}
                onRetranslateSingleCue={handleRetranslateSingleCue}
                onOpenCompareForCue={(cue) => {
                  setSelectedCueId(cue.id);
                  setActiveView('matrix');
                }}
                onPlayTts={handlePlayCueTts}
              />
            </>
          )}

          {activeView === 'matrix' && (
            <StyleMatrixPanel
              cues={cues}
              focusedCue={focusedCue}
              movieContext={movieContext}
              activeBurmeseStyle={activeBurmeseStyle}
              onSelectGlobalStyle={setActiveBurmeseStyle}
              onApplyStyleToCue={handleApplyStyleFromMatrix}
              onPlayTextTts={handlePlayTextTts}
              ttsLoadingKey={ttsLoadingKey}
            />
          )}

          {activeView === 'import' && (
            <ImportMediaPanel
              activeBurmeseStyle={activeBurmeseStyle}
              selectedTargetLanguages={selectedTargetLanguages}
              movieContext={movieContext}
              glossary={glossary}
              uploadedVideoUrl={uploadedVideoUrl}
              onUpdateContext={setMovieContext}
              onUpdateGlossary={setGlossary}
              onImportCues={handleImportCues}
              onUploadVideo={handleUploadVideo}
              onOpenWorkbench={() => setActiveView('workbench')}
            />
          )}

          {activeView === 'export' && (
            <ExportSubtitlesPanel
              projectTitle={projectTitle}
              cues={cues}
              activeBurmeseStyle={activeBurmeseStyle}
              selectedTargetLanguages={selectedTargetLanguages}
            />
          )}
        </main>
      </div>
    </div>
  );
}
