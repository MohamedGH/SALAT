import { useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { pickText, UI_COPY, type Language } from '../modules/i18n/translations';
import {
  generatePrayerSequence,
  getStepById,
} from '../modules/prayer/fiqhEngine';
import {
  DAILY_PRAYERS,
  PRAYER_STEPS,
  type PostureId,
} from '../modules/prayer/prayerData';
import {
  appStore,
  useAppSelector,
  type CameraPreset,
} from '../modules/state/store';
import {
  createPrayerScene,
  type PrayerSceneController,
} from '../modules/three/prayerScene';

interface PostureGuide3DProps {
  readonly language: Language;
}

const SchematicPostureFallback = ({
  stepId,
}: {
  readonly stepId: PostureId;
}) => {
  // Clean 2D side-profile vector posture schematic when WebGL is unavailable
  const posturePath: Record<PostureId, string> = {
    qiyam_ready: 'M 100 35 A 10 10 0 1 1 99.9 35 M 100 46 L 100 102 L 96 155 M 100 62 L 108 98',
    takbir_ihram: 'M 100 35 A 10 10 0 1 1 99.9 35 M 100 46 L 100 102 L 96 155 M 100 62 L 116 42',
    qiyam_qiraah: 'M 100 35 A 10 10 0 1 1 99.9 35 M 100 46 L 100 102 L 96 155 M 100 60 L 114 76 L 102 74',
    ruku: 'M 142 74 A 10 10 0 1 1 141.9 74 M 132 76 L 88 76 L 88 155 M 126 76 L 94 114',
    itidal: 'M 100 35 A 10 10 0 1 1 99.9 35 M 100 46 L 100 102 L 96 155 M 100 62 L 105 98',
    sujud_1: 'M 148 145 A 10 10 0 1 1 147.9 145 M 140 142 L 102 108 L 78 152 L 54 152 M 132 135 L 138 154',
    jalsa: 'M 94 74 A 10 10 0 1 1 93.9 74 M 94 86 L 94 134 L 122 152 L 76 152 M 94 98 L 116 122',
    sujud_2: 'M 148 145 A 10 10 0 1 1 147.9 145 M 140 142 L 102 108 L 78 152 L 54 152 M 132 135 L 138 154',
    tashahhud: 'M 94 74 A 10 10 0 1 1 93.9 74 M 94 86 L 94 134 L 122 152 L 76 152 M 94 98 L 124 120',
    taslim: 'M 94 74 A 10 10 0 1 1 93.9 74 M 94 86 L 94 134 L 122 152 L 76 152 M 94 98 L 116 122',
  };

  return (
    <svg
      viewBox="0 0 210 180"
      className="w-56 h-48 mx-auto"
      role="img"
      aria-label={`Schematic posture diagram for ${stepId}`}
    >
      <line
        x1="28"
        y1="158"
        x2="182"
        y2="158"
        stroke="#0F5C4D"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={posturePath[stepId]}
        fill="none"
        stroke="#18191C"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function PostureGuide3D({ language }: PostureGuide3DProps) {
  const activeStepId = useAppSelector((s) => s.activeStepId);
  const activePrayerId = useAppSelector((s) => s.activePrayerId);
  const isPlaying3D = useAppSelector((s) => s.isPlaying3D);
  const playbackSpeed = useAppSelector((s) => s.playbackSpeed);
  const cameraPreset = useAppSelector((s) => s.cameraPreset);
  const showAlignmentGuides = useAppSelector((s) => s.showAlignmentGuides);
  const controlsCollapsed = useAppSelector((s) => s.controlsCollapsed);
  const webglSupported = useAppSelector((s) => s.webglSupported);

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneControllerRef = useRef<PrayerSceneController | null>(null);

  const activeStep = getStepById(activeStepId);
  const activeSequence = generatePrayerSequence(activePrayerId);

  // Initialize Three.js Scene once in isolated mount div
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const state = appStore.getState();
    const res = createPrayerScene({
      container: mountEl,
      initialStepId: state.activeStepId,
      initialCameraPreset: state.cameraPreset,
      showAlignmentGuides: state.showAlignmentGuides,
      onContextLost: (errItem) => {
        appStore.dispatch({ type: 'SET_WEBGL_SUPPORTED', supported: false });
        appStore.dispatch({ type: 'REPORT_ERROR', error: errItem });
      },
    });

    if (!res.ok) {
      appStore.dispatch({ type: 'SET_WEBGL_SUPPORTED', supported: false });
      appStore.dispatch({ type: 'REPORT_ERROR', error: res.error });
      return;
    }

    appStore.dispatch({ type: 'SET_WEBGL_SUPPORTED', supported: true });
    sceneControllerRef.current = res.value;

    const handleResize = () => sceneControllerRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      sceneControllerRef.current?.dispose();
      sceneControllerRef.current = null;
    };
  }, []);

  // Synchronize posture transitions
  useEffect(() => {
    sceneControllerRef.current?.setStep(activeStepId);
  }, [activeStepId]);

  // Synchronize camera presets
  useEffect(() => {
    sceneControllerRef.current?.setCameraPreset(cameraPreset);
  }, [cameraPreset]);

  // Synchronize alignment guides visibility
  useEffect(() => {
    sceneControllerRef.current?.setAlignmentGuides(showAlignmentGuides);
  }, [showAlignmentGuides]);

  // Keyboard shortcut 'H' to toggle HUD dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        appStore.dispatch({ type: 'TOGGLE_CONTROLS_COLLAPSED' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Auto-playback interval
  useEffect(() => {
    if (!isPlaying3D) return;
    const intervalMs = Math.round(3200 / playbackSpeed);
    const timer = window.setInterval(() => {
      appStore.dispatch({ type: 'NEXT_STEP' });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying3D, playbackSpeed]);

  const cameraButtons: readonly {
    readonly id: CameraPreset;
    readonly label: string;
  }[] = [
    {
      id: 'threeQuarter',
      label: pickText(language, UI_COPY.guide3d.cameras.threeQuarter),
    },
    {
      id: 'profile',
      label: pickText(language, UI_COPY.guide3d.cameras.profile),
    },
    { id: 'top', label: pickText(language, UI_COPY.guide3d.cameras.top) },
    {
      id: 'closeUp',
      label: pickText(language, UI_COPY.guide3d.cameras.closeUp),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Workspace Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#18191C]">
            {pickText(language, UI_COPY.guide3d.title)}
          </h1>
          <p className="text-xs text-[#5D6066] mt-1">
            {language === 'fr'
              ? 'Glissez pour pivoter autour du modèle · Pincez/molette pour zoomer · Touche H pour masquer les contrôles'
              : 'Drag to orbit around the posture · Scroll/pinch to zoom · Press H to collapse dock'}
          </p>
        </div>

        {/* Prayer Template Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {DAILY_PRAYERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                appStore.dispatch({ type: 'SET_PRAYER', prayerId: p.id })
              }
              className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activePrayerId === p.id
                  ? 'bg-[#0F5C4D] text-white'
                  : 'bg-white border border-[#E5E0D8] text-[#4A4D52] hover:bg-[#FAF8F5]'
              }`}
            >
              {pickText(language, p.name)} · {p.rakahs}R
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Zone Stage + Concept Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Viewport Stage (Unobstructed Center + Collapsible Bottom Dock) */}
        <div className="lg:col-span-8 relative bg-[#F2EFE9] border border-[#E5E0D8] rounded-2xl overflow-hidden h-[430px] sm:h-[520px] lg:h-[600px]">
          {/* Isolated WebGL Mount Container */}
          {webglSupported ? (
            <div
              ref={canvasMountRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#F2EFE9]">
              <SchematicPostureFallback stepId={activeStep.id} />
              <p className="text-sm font-semibold text-[#18191C]">
                {pickText(language, UI_COPY.guide3d.webglFallbackTitle)}
              </p>
              <p className="text-xs text-[#4A4D52] max-w-md">
                {pickText(language, UI_COPY.guide3d.webglFallbackDesc)}
              </p>
            </div>
          )}

          {/* Minimal Top-Left Unboxed Spec Overlay (No backdrop-blur over WebGL!) */}
          <div className="pointer-events-none absolute top-4 left-4 z-10 bg-white/95 border border-[#E5E0D8] rounded-xl px-3.5 py-2">
            <div className="flex items-center gap-2 text-xs text-[#5D6066]">
              <span className="font-mono font-semibold text-[#0F5C4D] tabular-nums">
                {String(activeStep.order).padStart(2, '0')}/10
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-[#18191C]">
                {activeStep.transliteration}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {pickText(language, UI_COPY.categories[activeStep.category])}
              </span>
            </div>
          </div>

          {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion, Zero backdrop-blur) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[min(94%,740px)] flex flex-col items-center">
            <button
              type="button"
              onClick={() =>
                appStore.dispatch({ type: 'TOGGLE_CONTROLS_COLLAPSED' })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-white/95 border border-b-0 border-[#E5E0D8] text-[11px] font-medium text-[#4A4D52] hover:text-[#18191C] transition-colors whitespace-nowrap shrink-0"
            >
              {controlsCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>{pickText(language, UI_COPY.guide3d.showControls)}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>{pickText(language, UI_COPY.guide3d.hideControls)}</span>
                </>
              )}
            </button>

            {!controlsCollapsed && (
              <div className="w-full bg-white/95 border border-[#E5E0D8] rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
                {/* Playback Group */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => appStore.dispatch({ type: 'PREV_STEP' })}
                    aria-label={pickText(language, UI_COPY.guide3d.prev)}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg bg-[#F1EFEA] text-[#18191C] hover:bg-[#E5E0D8] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      appStore.dispatch({ type: 'TOGGLE_PLAY_3D' })
                    }
                    className="min-h-[40px] px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#0F5C4D] text-white text-xs font-medium hover:bg-[#0B493D] transition-colors whitespace-nowrap shrink-0"
                  >
                    {isPlaying3D ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>{pickText(language, UI_COPY.guide3d.pause)}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>{pickText(language, UI_COPY.guide3d.play)}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => appStore.dispatch({ type: 'NEXT_STEP' })}
                    aria-label={pickText(language, UI_COPY.guide3d.next)}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg bg-[#F1EFEA] text-[#18191C] hover:bg-[#E5E0D8] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      appStore.dispatch({
                        type: 'TOGGLE_PLAY_3D',
                        playing: false,
                      });
                      appStore.dispatch({
                        type: 'SET_STEP',
                        stepId: 'qiyam_ready',
                      });
                    }}
                    aria-label={pickText(language, UI_COPY.guide3d.reset)}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg bg-[#F1EFEA] text-[#4A4D52] hover:bg-[#E5E0D8] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Camera Preset Segmented Buttons */}
                <div className="flex items-center gap-1 bg-[#F1EFEA] p-1 rounded-lg overflow-x-auto max-w-full">
                  {cameraButtons.map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() =>
                        appStore.dispatch({
                          type: 'SET_CAMERA_PRESET',
                          preset: cam.id,
                        })
                      }
                      className={`px-2.5 py-1.5 min-h-[32px] rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                        cameraPreset === cam.id
                          ? 'bg-white text-[#18191C] shadow-xs'
                          : 'text-[#55585E] hover:text-[#18191C]'
                      }`}
                    >
                      {cam.label}
                    </button>
                  ))}
                </div>

                {/* Speed & Alignment Guides Toggle */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      appStore.dispatch({ type: 'TOGGLE_ALIGNMENT_GUIDES' })
                    }
                    className={`min-h-[36px] px-2.5 inline-flex items-center gap-1.5 rounded-lg border text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      showAlignmentGuides
                        ? 'bg-[#ECFDF5] border-[#0F5C4D] text-[#0F5C4D]'
                        : 'bg-white border-[#E5E0D8] text-[#55585E]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>
                      {pickText(language, UI_COPY.guide3d.alignmentGuides)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next =
                        playbackSpeed === 1
                          ? 1.5
                          : playbackSpeed === 1.5
                            ? 0.5
                            : 1;
                      appStore.dispatch({
                        type: 'SET_PLAYBACK_SPEED',
                        speed: next,
                      });
                    }}
                    className="min-h-[36px] px-2.5 rounded-lg bg-[#F1EFEA] text-[11px] font-mono font-medium text-[#18191C] whitespace-nowrap shrink-0 tabular-nums"
                  >
                    {playbackSpeed}x
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Concept, Arabic Recitation & Posture Checkpoints Deck */}
        <div className="lg:col-span-4 bg-white border border-[#E5E0D8] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 border-b border-[#EAE5DC] pb-4">
            <div>
              <p className="text-xs font-medium text-[#0F5C4D]">
                {pickText(language, UI_COPY.categories[activeStep.category])}
              </p>
              <h2 className="font-display text-xl font-semibold text-[#18191C] mt-0.5">
                {pickText(language, activeStep.title)}
              </h2>
            </div>
            <span className="font-arabic text-xl text-[#0F5C4D] shrink-0">
              {activeStep.arabicName}
            </span>
          </div>

          {/* Recitation Box */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1.5 text-center">
            <p className="font-arabic text-2xl leading-relaxed text-[#18191C]">
              {activeStep.recitationArabic}
            </p>
            <p className="text-xs font-semibold text-[#0F5C4D]">
              {activeStep.recitationTranslit}
            </p>
            <p className="text-xs text-[#4A4D52]">
              {pickText(language, activeStep.recitationMeaning)}
            </p>
          </div>

          {/* Spatial Summary & Anatomical Checkpoints */}
          <div className="space-y-3">
            <p className="text-sm text-[#3E4147] leading-relaxed">
              {pickText(language, activeStep.postureSummary)}
            </p>
            <div className="text-xs font-mono text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2">
              {pickText(language, activeStep.alignmentNote)}
            </div>
            <ul className="space-y-2 pt-1">
              {activeStep.checkpoints.map((cp, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-[#3E4147]"
                >
                  <span className="font-mono text-[#0F5C4D] font-semibold shrink-0">
                    0{idx + 1}.
                  </span>
                  <span>{pickText(language, cp)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 10-Step Posture Selector Grid */}
          <div className="pt-3 border-t border-[#EAE5DC] space-y-2">
            <p className="text-xs font-medium text-[#5D6066]">
              {language === 'fr'
                ? `Séquence (${activeSequence.length} étapes en ${DAILY_PRAYERS.find((p) => p.id === activePrayerId)?.rakahs} Rak’ahs)`
                : `Step Sequence (${activeSequence.length} steps across ${DAILY_PRAYERS.find((p) => p.id === activePrayerId)?.rakahs} Rak’ahs)`}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PRAYER_STEPS.map((step) => {
                const isSelected = step.id === activeStep.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() =>
                      appStore.dispatch({ type: 'SET_STEP', stepId: step.id })
                    }
                    className={`px-2.5 py-2 min-h-[38px] rounded-lg text-left text-xs transition-colors flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#0F5C4D] text-white font-medium'
                        : 'bg-[#FAF8F5] text-[#3E4147] hover:bg-[#EFEAE0]'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-80 shrink-0 tabular-nums">
                      {String(step.order).padStart(2, '0')}
                    </span>
                    <span className="truncate">
                      {step.transliteration.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
