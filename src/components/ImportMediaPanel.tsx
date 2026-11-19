import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Upload,
  Mic,
  Square,
  Loader2,
  Film,
  Wand2,
  Check,
  Trash2,
  Volume2,
  FileAudio,
} from 'lucide-react';
import {
  BURMESE_STYLES,
  BurmeseStyle,
  SubtitleCue,
  createEmptyStyleMap,
} from '../types/subtitle';
import { parseSrtOrVtt } from '../utils/srtUtils';
import {
  extractCompactAudioFromMedia,
  fileToBase64,
  formatFileSize,
} from '../utils/mediaUtils';
import {
  generateSubtitlesFromMedia,
  segmentAndTranslateScript,
  transcribeAudioFile,
} from '../services/subtitleApi';

interface ImportMediaPanelProps {
  activeBurmeseStyle: BurmeseStyle;
  selectedTargetLanguages: string[];
  movieContext: string;
  glossary: string;
  uploadedVideoUrl: string | null;
  onUpdateContext: (context: string) => void;
  onUpdateGlossary: (glossary: string) => void;
  onImportCues: (cues: SubtitleCue[], title?: string) => void;
  onUploadVideo: (file: File, stayOnCurrentTab?: boolean) => void;
  onOpenWorkbench: () => void;
}

type MediaImportTab = 'voice' | 'text' | 'video';

export const ImportMediaPanel: React.FC<ImportMediaPanelProps> = ({
  activeBurmeseStyle,
  selectedTargetLanguages,
  movieContext,
  glossary,
  uploadedVideoUrl,
  onUpdateContext,
  onUpdateGlossary,
  onImportCues,
  onUploadVideo,
  onOpenWorkbench,
}) => {
  const [activeTab, setActiveTab] = useState<MediaImportTab>('voice');
  const [selectedStyle, setSelectedStyle] = useState<BurmeseStyle>(activeBurmeseStyle);

  // Voice Import State (Mic Recorder + Audio Upload)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceName, setVoiceName] = useState<string>('');
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceDragActive, setVoiceDragActive] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Text Import State (Raw Script + SRT/VTT/TXT Upload)
  const [textMode, setTextMode] = useState<'script' | 'srt'>('script');
  const [projectName, setProjectName] = useState('Custom Movie Recap Episode');
  const [rawScript, setRawScript] = useState(
    'A retired safecracker is forced back for one final job inside a flooded underground vault in Zurich. His daughter is being held hostage by a ruthless art broker who hired a rival crew to double-cross him. With only four minutes before the pressure doors seal forever, he swaps the real diamond with a decoy and turns the syndicate against itself.'
  );
  const [rawSrt, setRawSrt] = useState('');
  const [targetDuration, setTargetDuration] = useState(40);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [textDragActive, setTextDragActive] = useState(false);
  const textFileInputRef = useRef<HTMLInputElement | null>(null);

  // Video Import State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoStageNote, setVideoStageNote] = useState<string | null>(null);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Shared Status Banners
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedStyle(activeBurmeseStyle);
  }, [activeBurmeseStyle]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
      if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
    };
  }, [voicePreviewUrl]);

  const clearBanners = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  // --- VOICE HANDLERS ---
  const attachVoiceMedia = (blob: Blob, name: string) => {
    clearBanners();
    if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
    const nextUrl = URL.createObjectURL(blob);
    setVoiceBlob(blob);
    setVoiceName(name);
    setVoicePreviewUrl(nextUrl);
    setVoiceTranscript('');
  };

  const handleStartRecording = async () => {
    clearBanners();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Microphone recording is not supported in this browser. Upload an audio file instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      recordingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        const mime = recorder.mimeType || 'audio/webm';
        const recordedBlob = new Blob(recordingChunksRef.current, { type: mime });
        if (recordedBlob.size > 0) {
          attachVoiceMedia(
            recordedBlob,
            `voice_recap_${new Date().toTimeString().slice(0, 8).replace(/:/g, '-')}.webm`
          );
          setStatusMessage('Voice recording captured. Click "Generate Burmese Subtitles from Voice" below.');
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setErrorMessage(
        'Microphone access was denied or unavailable. Please allow microphone permission or upload an audio file.'
      );
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleVoiceFileSelected = (file: File) => {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i.test(file.name)) {
      setErrorMessage('Please select a valid audio file (.mp3, .wav, .m4a, .ogg, .webm).');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setErrorMessage('Voice file must be under 30 MB.');
      return;
    }
    attachVoiceMedia(file, file.name);
    setStatusMessage(`Loaded voice file "${file.name}" (${formatFileSize(file.size)}).`);
  };

  const handleTranscribeVoiceOnly = async () => {
    if (!voiceBlob) return;
    clearBanners();
    setIsProcessingVoice(true);
    try {
      const base64Audio = await fileToBase64(voiceBlob);
      const { transcript } = await transcribeAudioFile({
        base64Audio,
        mimeType: voiceBlob.type || 'audio/webm',
      });
      if (!transcript.trim()) {
        throw new Error('No speech was detected in the uploaded voice clip.');
      }
      setVoiceTranscript(transcript);
      setRawScript(transcript);
      setStatusMessage('Voice transcribed cleanly. You can edit the transcript or generate timed Burmese subtitles.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Voice transcription failed.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleGenerateSubtitlesFromVoice = async () => {
    if (!voiceBlob) return;
    clearBanners();
    setIsProcessingVoice(true);
    try {
      const base64Media = await fileToBase64(voiceBlob);
      const data = await generateSubtitlesFromMedia({
        base64Media,
        mimeType: voiceBlob.type || 'audio/webm',
        burmeseStyle: selectedStyle,
        targetLanguages: selectedTargetLanguages,
        movieContext,
        glossary,
        durationSeconds: recordingSeconds > 0 ? recordingSeconds : undefined,
      });

      const mapped: SubtitleCue[] = (data.cues || []).map((c, idx) => {
        const others: Record<string, string> = {};
        for (const t of c.otherTranslations || []) {
          others[t.language] = t.text;
        }
        return {
          id: `voice-cue-${Date.now()}-${idx + 1}`,
          index: idx + 1,
          startTime: c.startTime,
          endTime: c.endTime,
          speaker: c.speaker || 'Narrator',
          sourceText: c.sourceText,
          activeStyle: selectedStyle,
          burmeseByStyle: createEmptyStyleMap(selectedStyle, c.burmeseText),
          styleNuanceNote: c.styleNuanceNote,
          otherTranslations: others,
        };
      });

      if (mapped.length === 0) {
        throw new Error('Could not detect timed speech cues from this voice clip.');
      }

      if (data.transcript) {
        setVoiceTranscript(data.transcript);
      }

      const cleanTitle = voiceName ? voiceName.replace(/\.[^/.]+$/, '') : 'Voice Recap Import';
      onImportCues(mapped, cleanTitle);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate subtitles from voice.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // --- TEXT HANDLERS ---
  const handleTextFileUpload = async (file: File) => {
    clearBanners();
    try {
      const content = await file.text();
      const baseTitle = file.name.replace(/\.(srt|vtt|txt|md)$/i, '');
      setProjectName(baseTitle);

      const looksLikeSrt = content.includes('-->');
      if (looksLikeSrt) {
        setTextMode('srt');
        setRawSrt(content);
        const parsed = parseSrtOrVtt(content, selectedStyle);
        if (parsed.length > 0) {
          onImportCues(parsed, baseTitle);
          return;
        }
      }

      setTextMode('script');
      setRawScript(content);
      setStatusMessage(
        `Loaded text file "${file.name}" (${content.length} chars). Click "Auto-Segment & Translate into Burmese" to create timed cues.`
      );
    } catch {
      setErrorMessage('Failed to read the selected text or subtitle file.');
    }
  };

  const handleGenerateFromScript = async () => {
    if (!rawScript.trim()) return;
    clearBanners();
    setIsSegmenting(true);
    try {
      const data = await segmentAndTranslateScript({
        rawScript: rawScript.trim(),
        burmeseStyle: selectedStyle,
        targetDurationSeconds: targetDuration,
      });

      const mapped: SubtitleCue[] = (data.cues || []).map((c, idx) => ({
        id: `text-cue-${Date.now()}-${idx + 1}`,
        index: idx + 1,
        startTime: c.startTime,
        endTime: c.endTime,
        speaker: c.speaker || 'Narrator',
        sourceText: c.sourceText,
        activeStyle: selectedStyle,
        burmeseByStyle: createEmptyStyleMap(selectedStyle, c.burmeseText),
        styleNuanceNote: c.styleNuanceNote,
        otherTranslations: { English: c.sourceText },
      }));

      if (mapped.length === 0) {
        throw new Error('No subtitle cues were returned. Try providing a longer script.');
      }

      onImportCues(mapped, projectName.trim() || 'Custom Movie Recap');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to segment and translate script.');
    } finally {
      setIsSegmenting(false);
    }
  };

  const handleParseRawSrt = () => {
    clearBanners();
    const parsed = parseSrtOrVtt(rawSrt, selectedStyle);
    if (parsed.length === 0) {
      setErrorMessage(
        'Could not parse valid SRT or WebVTT timecodes. Ensure lines include "00:00:00,000 --> 00:00:04,000".'
      );
      return;
    }
    onImportCues(parsed, projectName.trim() || 'Imported Subtitle Track');
  };

  // --- VIDEO HANDLERS ---
  const handleVideoFileSelected = (file: File) => {
    clearBanners();
    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov|mkv|m4v)$/i.test(file.name)) {
      setErrorMessage('Please select a valid video file (.mp4, .webm, .mov, .mkv).');
      return;
    }
    setVideoFile(file);
    setVideoDuration(null);
    onUploadVideo(file, true);
    setStatusMessage(
      `Attached video "${file.name}" (${formatFileSize(file.size)}) to the Cinema Monitor. Click "Auto-Generate Burmese Subtitles from Video" to extract timed dialogue.`
    );
  };

  const handleGenerateSubtitlesFromVideo = async () => {
    if (!videoFile) return;
    clearBanners();
    setIsProcessingVideo(true);
    setVideoStageNote('Preparing video media for AI analysis...');

    try {
      let base64Media = '';
      let mimeType = videoFile.type || 'video/mp4';
      let detectedDuration = videoDuration ?? undefined;

      // For videos larger than 10 MB, extract a compact 16kHz mono WAV audio track in-browser
      // so even large HD MP4 movie recap files stay lightweight and fast.
      if (videoFile.size > 10 * 1024 * 1024) {
        setVideoStageNote('Extracting compact audio track from HD video in browser...');
        try {
          const extracted = await extractCompactAudioFromMedia(videoFile);
          base64Media = await fileToBase64(extracted.wavBlob);
          mimeType = 'audio/wav';
          detectedDuration = extracted.durationSeconds;
        } catch {
          if (videoFile.size > 28 * 1024 * 1024) {
            throw new Error(
              'This video codec could not be decoded for browser audio extraction and exceeds 28 MB. Please upload an MP4/WebM under 28 MB or import its audio track in the Voice tab.'
            );
          }
          base64Media = await fileToBase64(videoFile);
        }
      } else {
        base64Media = await fileToBase64(videoFile);
      }

      setVideoStageNote(`Analyzing dialogue & translating into ${selectedStyle} Burmese...`);

      const data = await generateSubtitlesFromMedia({
        base64Media,
        mimeType,
        burmeseStyle: selectedStyle,
        targetLanguages: selectedTargetLanguages,
        movieContext,
        glossary,
        durationSeconds: detectedDuration,
      });

      const mapped: SubtitleCue[] = (data.cues || []).map((c, idx) => {
        const others: Record<string, string> = {};
        for (const t of c.otherTranslations || []) {
          others[t.language] = t.text;
        }
        return {
          id: `video-cue-${Date.now()}-${idx + 1}`,
          index: idx + 1,
          startTime: c.startTime,
          endTime: c.endTime,
          speaker: c.speaker || 'Narrator',
          sourceText: c.sourceText,
          activeStyle: selectedStyle,
          burmeseByStyle: createEmptyStyleMap(selectedStyle, c.burmeseText),
          styleNuanceNote: c.styleNuanceNote,
          otherTranslations: others,
        };
      });

      if (mapped.length === 0) {
        throw new Error('No spoken dialogue cues were returned for this video.');
      }

      onImportCues(mapped, videoFile.name.replace(/\.[^/.]+$/, ''));
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to extract subtitles from video.');
    } finally {
      setIsProcessingVideo(false);
      setVideoStageNote(null);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Unified Import Media Hub */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Header + 3-Way Media Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Import Media — Voice, Text &amp; Video
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bring in recorded or uploaded voiceovers, raw text or SRT/VTT scripts, or movie recap videos for automatic Burmese subtitle generation.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {(
              [
                { id: 'voice', label: 'Voice', icon: Mic },
                { id: 'text', label: 'Text', icon: FileText },
                { id: 'video', label: 'Video', icon: Film },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    clearBanners();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shared Target Burmese Style Bar */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Target Burmese Style for Imported Media
          </span>
          <select
            aria-label="Target Burmese style for import"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value as BurmeseStyle)}
            className="bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            {BURMESE_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.burmeseLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="p-5 space-y-5">
          {/* 1. VOICE IMPORT TAB */}
          {activeTab === 'voice' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Live Mic Recorder */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        <Mic className="w-4 h-4 text-amber-400" />
                        Record Voice Recap
                      </h3>
                      <span className="text-xs font-mono-tabular text-slate-400">
                        {formatTimer(recordingSeconds)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Narrate your movie recap directly into your microphone in any language. AI will transcribe and localize it into timed Burmese subtitles.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        Start Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        Stop Recording ({formatTimer(recordingSeconds)})
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload Voice / Audio Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setVoiceDragActive(true);
                  }}
                  onDragLeave={() => setVoiceDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setVoiceDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleVoiceFileSelected(file);
                  }}
                  className={`p-5 bg-slate-950 border border-dashed rounded-xl flex flex-col justify-between gap-4 transition-colors ${
                    voiceDragActive ? 'border-amber-400 bg-amber-500/5' : 'border-slate-700'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-amber-400" />
                      Upload Voice / Audio File
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Drag and drop or browse a recap voiceover track (.mp3, .wav, .m4a, .ogg, .webm up to 30 MB).
                    </p>
                  </div>

                  <div>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVoiceFileSelected(file);
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Choose Audio File
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Voice Preview & AI Processing Bar */}
              {voiceBlob && voicePreviewUrl && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-100 truncate">{voiceName}</p>
                        <p className="text-[11px] text-slate-400 font-mono-tabular">
                          {formatFileSize(voiceBlob.size)} · {voiceBlob.type || 'audio'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
                        setVoiceBlob(null);
                        setVoicePreviewUrl(null);
                        setVoiceName('');
                        setVoiceTranscript('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md"
                      aria-label="Remove audio clip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <audio controls src={voicePreviewUrl} className="w-full h-10" />

                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      disabled={isProcessingVoice}
                      onClick={handleTranscribeVoiceOnly}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessingVoice ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      Transcribe Only
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingVoice}
                      onClick={handleGenerateSubtitlesFromVoice}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessingVoice ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                      {isProcessingVoice
                        ? 'Processing Voice with AI...'
                        : 'Generate Timed Burmese Subtitles from Voice'}
                    </button>
                  </div>

                  {voiceTranscript && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <label className="block text-xs font-medium text-amber-300">
                        Voice Transcript (Editable)
                      </label>
                      <textarea
                        rows={3}
                        value={voiceTranscript}
                        onChange={(e) => {
                          setVoiceTranscript(e.target.value);
                          setRawScript(e.target.value);
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. TEXT IMPORT TAB */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              {/* Text / SRT / VTT File Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setTextDragActive(true);
                }}
                onDragLeave={() => setTextDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setTextDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleTextFileUpload(file);
                }}
                className={`flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950 border border-dashed rounded-xl transition-colors ${
                  textDragActive ? 'border-amber-400 bg-amber-500/5' : 'border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      Upload .TXT, .SRT, .VTT, or .MD File
                    </p>
                    <p className="text-xs text-slate-400">
                      SRT/VTT timecodes load straight into the cue sheet; plain text scripts load into the AI segmenter.
                    </p>
                  </div>
                </div>

                <div>
                  <input
                    ref={textFileInputRef}
                    type="file"
                    accept=".srt,.vtt,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleTextFileUpload(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => textFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Choose Text / Subtitle File
                  </button>
                </div>
              </div>

              {/* Sub-mode Toggle: Raw Script vs Timed SRT */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTextMode('script')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      textMode === 'script'
                        ? 'bg-slate-800 text-amber-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Raw Recap Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextMode('srt')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      textMode === 'srt'
                        ? 'bg-slate-800 text-amber-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Timed SRT / VTT
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    aria-label="Episode title"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Episode title"
                    className="w-56 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  {textMode === 'script' && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Duration (s):</span>
                      <input
                        type="number"
                        min={10}
                        max={300}
                        value={targetDuration}
                        onChange={(e) => setTargetDuration(Number(e.target.value) || 40)}
                        className="w-20 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono-tabular text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {textMode === 'script' ? (
                <div className="space-y-3">
                  <textarea
                    rows={5}
                    value={rawScript}
                    onChange={(e) => setRawScript(e.target.value)}
                    placeholder="Paste movie recap narration or story script in English, Korean, Japanese, Chinese, Thai, or any language..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSegmenting || !rawScript.trim()}
                      onClick={handleGenerateFromScript}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSegmenting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                      {isSegmenting
                        ? 'Segmenting & Translating...'
                        : 'Auto-Segment & Translate into Burmese'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={rawSrt}
                    onChange={(e) => setRawSrt(e.target.value)}
                    placeholder={`1\n00:00:00,000 --> 00:00:04,200\nThe heist began at midnight beneath the frozen river.`}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono-tabular text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!rawSrt.trim()}
                      onClick={handleParseRawSrt}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Parse SRT / VTT Into Workbench
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. VIDEO IMPORT TAB */}
          {activeTab === 'video' && (
            <div className="space-y-5">
              {/* Video Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setVideoDragActive(true);
                }}
                onDragLeave={() => setVideoDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setVideoDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleVideoFileSelected(file);
                }}
                className={`p-6 bg-slate-950 border border-dashed rounded-xl flex flex-wrap items-center justify-between gap-4 transition-colors ${
                  videoDragActive ? 'border-amber-400 bg-amber-500/5' : 'border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Film className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      Upload Movie Recap Video (.MP4, .WEBM, .MOV)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                      Attach your video directly to the Workbench Cinema Monitor and extract spoken narration into synced Burmese &amp; multi-language subtitles automatically. Large HD videos are automatically audio-compressed in-browser for fast AI processing.
                    </p>
                  </div>
                </div>

                <div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*,.mp4,.webm,.mov,.mkv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoFileSelected(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Choose Video File
                  </button>
                </div>
              </div>

              {/* Loaded Video Preview + AI Auto-Subtitle Trigger */}
              {uploadedVideoUrl && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-100 truncate">
                        {videoFile ? videoFile.name : 'Attached Local Recap Video'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono-tabular">
                        {videoFile ? formatFileSize(videoFile.size) : 'Loaded in monitor'}
                        {videoDuration ? ` · ${formatTimer(videoDuration)} duration` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onOpenWorkbench}
                        className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Preview in Workbench
                      </button>

                      {videoFile && (
                        <button
                          type="button"
                          disabled={isProcessingVideo}
                          onClick={handleGenerateSubtitlesFromVideo}
                          className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {isProcessingVideo ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                          {isProcessingVideo
                            ? 'Generating Subtitles...'
                            : 'Auto-Generate Burmese Subtitles from Video'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-black max-h-[320px] flex items-center justify-center">
                    <video
                      src={uploadedVideoUrl}
                      controls
                      onLoadedMetadata={(e) => {
                        const dur = Math.round(e.currentTarget.duration);
                        if (Number.isFinite(dur) && dur > 0) setVideoDuration(dur);
                      }}
                      className="w-full max-h-[320px] object-contain"
                    />
                  </div>

                  {videoStageNote && (
                    <div className="px-4 py-2.5 border-t border-slate-800 flex items-center gap-2 text-xs text-amber-300">
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      {videoStageNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {statusMessage && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-950/50 border border-emerald-800/70 rounded-lg text-xs text-emerald-200">
              <Check className="w-4 h-4 shrink-0" />
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div className="px-3.5 py-2.5 bg-rose-950/50 border border-rose-800/70 rounded-lg text-xs text-rose-200">
              {errorMessage}
            </div>
          )}
        </div>
      </section>

      {/* Localization Context & Glossary Settings */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-100 mb-1">
          Movie Context &amp; Burmese Name Glossary
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Applied automatically whenever you import Voice, Text, or Video media so character names and genre mood stay consistent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Genre &amp; Plot Context
            </label>
            <textarea
              rows={3}
              value={movieContext}
              onChange={(e) => onUpdateContext(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500"
              placeholder="e.g., Korean zombie survival thriller recap, urgent narration..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Character &amp; Term Transliteration Glossary
            </label>
            <textarea
              rows={3}
              value={glossary}
              onChange={(e) => onUpdateGlossary(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-burmese text-slate-200 focus:outline-none focus:border-amber-500"
              placeholder="e.g., Detective Kim = စုံထောက်ကင်မ်, Vault 9 = အခန်း ၉"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
