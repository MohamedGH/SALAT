import { ArrowRight, Box, Network } from 'lucide-react';
import {
  ARCHITECTURE_RINGS,
  computeRingNodePositions,
} from '../modules/diagrams/diagramLayout';
import { pickText, UI_COPY, type Language } from '../modules/i18n/translations';
import type { FiqhCategory } from '../modules/prayer/prayerData';
import { syncBrowserHash } from '../modules/router/routeManager';
import { appStore } from '../modules/state/store';

interface OverviewSectionProps {
  readonly language: Language;
}

export function OverviewSection({ language }: OverviewSectionProps) {
  const goTo = (
    name: 'diagrams' | 'guide' | 'matrix',
    category?: FiqhCategory,
  ) => {
    if (category) {
      appStore.dispatch({ type: 'SET_DIAGRAM_CATEGORY', category });
    }
    const route =
      name === 'diagrams'
        ? { name: 'diagrams' as const, diagramMode: 'architecture' as const }
        : name === 'guide'
          ? {
              name: 'guide' as const,
              stepId: appStore.getState().activeStepId,
            }
          : { name: 'matrix' as const };
    appStore.dispatch({ type: 'NAVIGATE', route });
    syncBrowserHash(route);
  };

  const kpis = [
    {
      title: pickText(language, UI_COPY.hero.metrics.conditionsCount),
      desc: pickText(language, UI_COPY.hero.metrics.conditionsDesc),
      glyph: '◆',
      color: 'text-[#0369A1]',
      onClick: () => goTo('diagrams', 'condition'),
    },
    {
      title: pickText(language, UI_COPY.hero.metrics.pillarsCount),
      desc: pickText(language, UI_COPY.hero.metrics.pillarsDesc),
      glyph: '●',
      color: 'text-[#0F5C4D]',
      onClick: () => goTo('diagrams', 'pillar'),
    },
    {
      title: pickText(language, UI_COPY.hero.metrics.obligationsCount),
      desc: pickText(language, UI_COPY.hero.metrics.obligationsDesc),
      glyph: '▲',
      color: 'text-[#B45309]',
      onClick: () => goTo('diagrams', 'obligation'),
    },
    {
      title: pickText(language, UI_COPY.hero.metrics.posturesCount),
      desc: pickText(language, UI_COPY.hero.metrics.posturesDesc),
      glyph: '◈',
      color: 'text-[#18191C]',
      onClick: () => goTo('guide'),
    },
  ];

  const cx = 210;
  const cy = 210;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* 2-Column Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left Prose & Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium tracking-wide text-[#5D6066]">
                {pickText(language, UI_COPY.hero.kicker)}
              </p>

              {/* Language Segmented Control in Workspace/Hero (not in Top Bar) */}
              <div
                role="group"
                aria-label="Language"
                className="inline-flex items-center p-1 bg-[#F1EFEA] rounded-lg"
              >
                {(['en', 'fr'] as const).map((langOption) => (
                  <button
                    key={langOption}
                    type="button"
                    onClick={() =>
                      appStore.dispatch({
                        type: 'SET_LANGUAGE',
                        language: langOption,
                      })
                    }
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                      language === langOption
                        ? 'bg-white text-[#18191C] shadow-xs'
                        : 'text-[#5D6066] hover:text-[#18191C]'
                    }`}
                  >
                    {langOption === 'en' ? 'English' : 'Français'}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold leading-[1.15] text-[#18191C]">
              {pickText(language, UI_COPY.hero.title)}
            </h1>

            <p className="text-base text-[#4A4D52] leading-relaxed max-w-2xl">
              {pickText(language, UI_COPY.hero.subtitle)}
            </p>
          </div>

          <div className="pt-4 border-t border-[#EAE5DC] flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => goTo('guide')}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#0F5C4D] text-white text-sm font-medium hover:bg-[#0B493D] transition-colors whitespace-nowrap shrink-0"
            >
              <Box className="w-4 h-4" />
              <span>{pickText(language, UI_COPY.cta.start3d)}</span>
            </button>
            <button
              type="button"
              onClick={() => goTo('diagrams')}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#F1EFEA] text-[#18191C] text-sm font-medium hover:bg-[#E5E0D8] transition-colors whitespace-nowrap shrink-0"
            >
              <Network className="w-4 h-4" />
              <span>{pickText(language, UI_COPY.cta.exploreDiagram)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Interactive Structural Preview Diagram */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#5D6066]">
            <span className="font-medium text-[#18191C]">
              {language === 'fr'
                ? 'Structure Concentrique de la Prière'
                : 'Concentric Salah Structure'}
            </span>
            <span className="font-arabic text-base text-[#0F5C4D]">الصلاة</span>
          </div>

          <div className="my-2 flex items-center justify-center">
            <svg
              viewBox="0 0 420 420"
              className="w-full max-w-[330px] h-auto"
              role="img"
              aria-label="Interactive diagram of Conditions, Obligations, and Pillars of Salah"
            >
              {ARCHITECTURE_RINGS.slice()
                .reverse()
                .map((ring) => {
                  const points = computeRingNodePositions(
                    cx,
                    cy,
                    ring.radius,
                    ring.count,
                  );
                  return (
                    <g
                      key={ring.id}
                      onClick={() => goTo('diagrams', ring.id)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={ring.radius}
                        fill={ring.fill}
                        fillOpacity={0.55}
                        stroke={ring.color}
                        strokeWidth={1.75}
                        strokeDasharray={
                          ring.id === 'condition' ? '6 4' : undefined
                        }
                      />
                      {points.map((pt, i) => (
                        <circle
                          key={`${ring.id}-${i}`}
                          cx={pt.x}
                          cy={pt.y}
                          r={5.5}
                          fill="#FFFFFF"
                          stroke={ring.color}
                          strokeWidth={2}
                        />
                      ))}
                    </g>
                  );
                })}

              {/* Center Sanctuary Core */}
              <g
                onClick={() => goTo('guide')}
                className="cursor-pointer"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={44}
                  fill="#0F5C4D"
                />
                <text
                  x={cx}
                  y={cy - 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="600"
                >
                  {language === 'fr' ? 'Salah' : 'Salah'}
                </text>
                <text
                  x={cx}
                  y={cy + 14}
                  textAnchor="middle"
                  fill="#D1FAE5"
                  fontSize="10"
                >
                  {language === 'fr' ? '10 Postures' : '10 Postures'}
                </text>
              </g>
            </svg>
          </div>

          <div className="pt-3 border-t border-[#EAE5DC] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#5D6066]">
            <span>
              <span className="text-[#0369A1] font-semibold">◆</span>{' '}
              {language === 'fr' ? '9 Conditions' : '9 Conditions'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="text-[#B45309] font-semibold">▲</span>{' '}
              {language === 'fr' ? '8 Obligations' : '8 Obligations'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="text-[#0F5C4D] font-semibold">●</span>{' '}
              {language === 'fr' ? '14 Piliers' : '14 Pillars'}
            </span>
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column Summary Strip below Hero Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-[#E5E0D8] rounded-2xl divide-y sm:divide-y-0 sm:divide-x divide-[#EAE5DC]">
        {kpis.map((kpi) => (
          <button
            key={kpi.title}
            type="button"
            onClick={kpi.onClick}
            className="text-left p-5 sm:p-6 hover:bg-[#FAF8F5] transition-colors first:rounded-t-2xl last:rounded-b-2xl sm:first:rounded-l-2xl sm:first:rounded-tr-none sm:last:rounded-r-2xl sm:last:rounded-bl-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F5C4D]"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-[#5D6066]">
              <span className={kpi.color} aria-hidden="true">
                {kpi.glyph}
              </span>
              <span className="tabular-nums font-mono">{kpi.title}</span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-[#18191C]">
              {kpi.desc}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
