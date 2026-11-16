import { ArrowRight, Box, CheckCircle2, XCircle } from 'lucide-react';
import {
  ARCHITECTURE_RINGS,
  buildCurvedEdgePath,
  computeCycleDiagramNodes,
  computeRingNodePositions,
  getCategoryColorToken,
} from '../modules/diagrams/diagramLayout';
import { pickText, UI_COPY, type Language } from '../modules/i18n/translations';
import {
  evaluateOmissionOutcome,
  generatePrayerSequence,
  getStepById,
} from '../modules/prayer/fiqhEngine';
import {
  ALL_FIQH_RULES,
  ARKAN_PILLARS,
  DAILY_PRAYERS,
  SHURUT_CONDITIONS,
  WAJIBAT_OBLIGATIONS,
  type FiqhCategory,
  type FiqhRuleItem,
  type PostureId,
} from '../modules/prayer/prayerData';
import { syncBrowserHash } from '../modules/router/routeManager';
import {
  appStore,
  useAppSelector,
  type DiagramMode,
} from '../modules/state/store';

interface InteractiveDiagramsProps {
  readonly language: Language;
}

const getRulesForRing = (category: FiqhCategory): readonly FiqhRuleItem[] => {
  if (category === 'condition') return SHURUT_CONDITIONS;
  if (category === 'obligation') return WAJIBAT_OBLIGATIONS;
  return ARKAN_PILLARS;
};

export function InteractiveDiagrams({ language }: InteractiveDiagramsProps) {
  const mode = useAppSelector((s) => s.diagramMode);
  const selectedCategory = useAppSelector((s) => s.selectedDiagramCategory);
  const selectedRuleId = useAppSelector((s) => s.selectedRuleId);
  const omissionTiming = useAppSelector((s) => s.omissionTiming);
  const activeStepId = useAppSelector((s) => s.activeStepId);
  const activePrayerId = useAppSelector((s) => s.activePrayerId);

  const selectedRule =
    ALL_FIQH_RULES.find((r) => r.id === selectedRuleId) ?? ARKAN_PILLARS[0];
  const omissionOutcome = evaluateOmissionOutcome(
    selectedCategory,
    omissionTiming,
  );
  const activeStep = getStepById(activeStepId);
  const prayerSequence = generatePrayerSequence(activePrayerId);

  const setMode = (nextMode: DiagramMode) => {
    appStore.dispatch({ type: 'SET_DIAGRAM_MODE', mode: nextMode });
    syncBrowserHash({ name: 'diagrams', diagramMode: nextMode });
  };

  const openStepIn3D = (stepId: PostureId) => {
    appStore.dispatch({ type: 'SET_STEP', stepId });
    const route = { name: 'guide' as const, stepId };
    appStore.dispatch({ type: 'NAVIGATE', route });
    syncBrowserHash(route);
  };

  const cx = 240;
  const cy = 230;
  const cycleNodes = computeCycleDiagramNodes(cx, cy, 175, 165);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Header + Segmented Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E5E0D8] pb-5">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#18191C]">
            {pickText(language, UI_COPY.diagrams.title)}
          </h1>
          <p className="text-sm text-[#4A4D52] max-w-2xl">
            {pickText(language, UI_COPY.diagrams.subtitle)}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Diagram Modes"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EAE5DC] rounded-xl self-start"
        >
          {(
            [
              {
                id: 'architecture',
                label: pickText(language, UI_COPY.diagrams.modes.architecture),
              },
              {
                id: 'omission',
                label: pickText(language, UI_COPY.diagrams.modes.omission),
              },
              {
                id: 'cycle',
                label: pickText(language, UI_COPY.diagrams.modes.cycle),
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              onClick={() => setMode(tab.id)}
              className={`px-3.5 py-2 min-h-[40px] text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                mode === tab.id
                  ? 'bg-white text-[#18191C] shadow-xs'
                  : 'text-[#55585E] hover:text-[#18191C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Zone Interactive Stage + Concept Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Top Stage: Interactive SVG Diagram */}
        <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded-2xl p-4 sm:p-6">
          {mode === 'architecture' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5D6066]">
                <span>
                  {language === 'fr'
                    ? 'Cliquez sur un nœud ou anneau pour inspecter son rôle juridique'
                    : 'Select any ring node to inspect its Fiqh ruling'}
                </span>
                <div className="flex items-center gap-3">
                  <span>
                    <span className="text-[#0369A1]">◆</span> Shurut
                  </span>
                  <span>
                    <span className="text-[#B45309]">▲</span> Wajibat
                  </span>
                  <span>
                    <span className="text-[#0F5C4D]">●</span> Arkan
                  </span>
                </div>
              </div>

              <svg
                viewBox="0 0 480 460"
                className="w-full h-auto max-h-[470px]"
                role="img"
                aria-label="Salah Architectural Layers Diagram"
              >
                {ARCHITECTURE_RINGS.slice()
                  .reverse()
                  .map((ring) => {
                    const rules = getRulesForRing(ring.id);
                    const points = computeRingNodePositions(
                      cx,
                      cy,
                      ring.radius,
                      rules.length,
                    );
                    const isLayerSelected = selectedCategory === ring.id;

                    return (
                      <g key={ring.id}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={ring.radius}
                          fill={ring.fill}
                          fillOpacity={isLayerSelected ? 0.65 : 0.35}
                          stroke={ring.color}
                          strokeWidth={isLayerSelected ? 2.5 : 1.5}
                          strokeDasharray={
                            ring.id === 'condition' ? '7 4' : undefined
                          }
                          className="cursor-pointer transition-opacity"
                          onClick={() => {
                            appStore.dispatch({
                              type: 'SET_DIAGRAM_CATEGORY',
                              category: ring.id,
                            });
                            appStore.dispatch({
                              type: 'SET_SELECTED_RULE',
                              ruleId: rules[0].id,
                            });
                          }}
                        />

                        {points.map((pt, idx) => {
                          const rule = rules[idx];
                          const isNodeSelected = selectedRule.id === rule.id;
                          return (
                            <g
                              key={rule.id}
                              onClick={() => {
                                appStore.dispatch({
                                  type: 'SET_DIAGRAM_CATEGORY',
                                  category: ring.id,
                                });
                                appStore.dispatch({
                                  type: 'SET_SELECTED_RULE',
                                  ruleId: rule.id,
                                });
                              }}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isNodeSelected ? 15 : 12}
                                fill={isNodeSelected ? ring.color : '#FFFFFF'}
                                stroke={ring.color}
                                strokeWidth={2}
                              />
                              <text
                                x={pt.x}
                                y={pt.y + 3.5}
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="600"
                                fill={isNodeSelected ? '#FFFFFF' : ring.color}
                                className="font-mono select-none"
                              >
                                {rule.index}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}

                {/* Center Focal Anchor */}
                <circle cx={cx} cy={cy} r={42} fill="#0F5C4D" />
                <text
                  x={cx}
                  y={cy - 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="600"
                >
                  {language === 'fr' ? 'Prière' : 'Salah'}
                </text>
                <text
                  x={cx}
                  y={cy + 13}
                  textAnchor="middle"
                  fill="#D1FAE5"
                  fontSize="10"
                >
                  {selectedCategory === 'condition'
                    ? '◆ 9 Shurut'
                    : selectedCategory === 'obligation'
                      ? '▲ 8 Wajibat'
                      : '● 14 Arkan'}
                </text>
              </svg>
            </div>
          )}

          {mode === 'omission' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'condition', label: '◆ Shart' },
                      { id: 'pillar', label: '● Rukn' },
                      { id: 'obligation', label: '▲ Wajib' },
                      { id: 'sunnah', label: '○ Sunnah' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        appStore.dispatch({
                          type: 'SET_DIAGRAM_CATEGORY',
                          category: cat.id,
                        })
                      }
                      className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                        selectedCategory === cat.id
                          ? 'bg-[#0F5C4D] text-white border-[#0F5C4D]'
                          : 'bg-[#FAF8F5] text-[#4A4D52] border-[#E5E0D8] hover:border-[#C5BEB2]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center p-1 bg-[#F1EFEA] rounded-lg">
                  {(['deliberate', 'forgetful'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        appStore.dispatch({
                          type: 'SET_OMISSION_TIMING',
                          timing: t,
                        })
                      }
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                        omissionTiming === t
                          ? 'bg-white text-[#18191C] shadow-xs'
                          : 'text-[#5D6066]'
                      }`}
                    >
                      {t === 'deliberate'
                        ? pickText(language, UI_COPY.diagrams.simulateDeliberate)
                        : pickText(language, UI_COPY.diagrams.simulateForgetful)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive SVG Decision Flowchart */}
              <svg
                viewBox="0 0 560 360"
                className="w-full h-auto"
                role="img"
                aria-label="Salah Omission Decision Flowchart"
              >
                <defs>
                  <marker
                    id="flowArrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#0F5C4D" />
                  </marker>
                  <marker
                    id="flowArrowMuted"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#C8C2B8" />
                  </marker>
                </defs>

                {/* Step 1: Omission Type Node */}
                <rect
                  x="170"
                  y="16"
                  width="220"
                  height="52"
                  rx="10"
                  fill="#F1EFEA"
                  stroke="#0F5C4D"
                  strokeWidth="2"
                />
                <text
                  x="280"
                  y="38"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="#18191C"
                >
                  {language === 'fr' ? 'Acte Omis :' : 'Omitted Element:'}{' '}
                  {selectedCategory.toUpperCase()}
                </text>
                <text
                  x="280"
                  y="55"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#5D6066"
                >
                  {omissionTiming === 'deliberate'
                    ? pickText(language, UI_COPY.diagrams.simulateDeliberate)
                    : pickText(language, UI_COPY.diagrams.simulateForgetful)}
                </text>

                {/* Connectors */}
                <path
                  d="M 280 68 L 280 112"
                  stroke="#0F5C4D"
                  strokeWidth="2"
                  markerEnd="url(#flowArrow)"
                />

                {/* Step 2: Classification Check */}
                <rect
                  x="150"
                  y="114"
                  width="260"
                  height="54"
                  rx="10"
                  fill="#FFFFFF"
                  stroke={getCategoryColorToken(selectedCategory).stroke}
                  strokeWidth="2"
                />
                <text
                  x="280"
                  y="137"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="#18191C"
                >
                  {selectedCategory === 'condition'
                    ? language === 'fr'
                      ? 'Prérequis avant la prière ?'
                      : 'Pre-prayer Prerequisite?'
                    : selectedCategory === 'pillar'
                      ? language === 'fr'
                        ? 'Pilier fondamental (Rukn) ?'
                        : 'Essential Pillar (Rukn)?'
                      : selectedCategory === 'obligation'
                        ? language === 'fr'
                          ? 'Obligation compensable (Wajib) ?'
                          : 'Compensable Obligation (Wajib)?'
                        : language === 'fr'
                          ? 'Acte recommandé (Sunnah) ?'
                          : 'Recommended Act (Sunnah)?'}
                </text>
                <text
                  x="280"
                  y="155"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#5D6066"
                >
                  {omissionOutcome.requiresRepeatAct
                    ? language === 'fr'
                      ? 'Rattrapage requis du pilier'
                      : 'Must perform the missed pillar'
                    : omissionOutcome.requiresSujudSahw
                      ? language === 'fr'
                        ? 'Réparable par Sujud al-Sahw'
                        : 'Repaired via Sujud al-Sahw'
                      : omissionOutcome.prayerValid
                        ? language === 'fr'
                          ? 'Aucun Sujud al-Sahw requis'
                          : 'No Sujud al-Sahw required'
                        : language === 'fr'
                          ? 'Sujud al-Sahw ne suffit pas'
                          : 'Sujud al-Sahw cannot compensate'}
                </text>

                {/* Left / Right Branches */}
                <path
                  d="M 220 168 L 125 224"
                  stroke={!omissionOutcome.prayerValid ? '#DC2626' : '#D6D1C7'}
                  strokeWidth={!omissionOutcome.prayerValid ? 2.5 : 1.5}
                  markerEnd={
                    !omissionOutcome.prayerValid
                      ? 'url(#flowArrow)'
                      : 'url(#flowArrowMuted)'
                  }
                />
                <path
                  d="M 340 168 L 435 224"
                  stroke={omissionOutcome.prayerValid ? '#0F5C4D' : '#D6D1C7'}
                  strokeWidth={omissionOutcome.prayerValid ? 2.5 : 1.5}
                  markerEnd={
                    omissionOutcome.prayerValid
                      ? 'url(#flowArrow)'
                      : 'url(#flowArrowMuted)'
                  }
                />

                {/* Outcome Left: Invalid */}
                <rect
                  x="24"
                  y="228"
                  width="210"
                  height="84"
                  rx="12"
                  fill={!omissionOutcome.prayerValid ? '#FEF2F2' : '#FAF8F5'}
                  stroke={!omissionOutcome.prayerValid ? '#DC2626' : '#E5E0D8'}
                  strokeWidth={!omissionOutcome.prayerValid ? 2 : 1}
                />
                <text
                  x="129"
                  y="256"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={!omissionOutcome.prayerValid ? '#991B1B' : '#8A8D93'}
                >
                  ✕ {language === 'fr' ? 'Prière Invalide' : 'Prayer Invalid'}
                </text>
                <text
                  x="129"
                  y="278"
                  textAnchor="middle"
                  fontSize="11"
                  fill={!omissionOutcome.prayerValid ? '#7F1D1D' : '#8A8D93'}
                >
                  {language === 'fr'
                    ? 'À recommencer entièrement'
                    : 'Must repeat entire prayer'}
                </text>

                {/* Outcome Right: Valid */}
                <rect
                  x="326"
                  y="228"
                  width="210"
                  height="84"
                  rx="12"
                  fill={omissionOutcome.prayerValid ? '#ECFDF5' : '#FAF8F5'}
                  stroke={omissionOutcome.prayerValid ? '#0F5C4D' : '#E5E0D8'}
                  strokeWidth={omissionOutcome.prayerValid ? 2 : 1}
                />
                <text
                  x="431"
                  y="256"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={omissionOutcome.prayerValid ? '#065F46' : '#8A8D93'}
                >
                  ✓ {language === 'fr' ? 'Prière Valide' : 'Prayer Valid'}
                </text>
                <text
                  x="431"
                  y="278"
                  textAnchor="middle"
                  fontSize="11"
                  fill={omissionOutcome.prayerValid ? '#065F46' : '#8A8D93'}
                >
                  {omissionOutcome.requiresSujudSahw
                    ? language === 'fr'
                      ? 'Avec Sujud al-Sahw'
                      : 'With Sujud al-Sahw'
                    : language === 'fr'
                      ? 'Sans Sujud al-Sahw'
                      : 'No Sujud Sahw needed'}
                </text>
              </svg>
            </div>
          )}

          {mode === 'cycle' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5D6066]">
                <span>
                  {language === 'fr'
                    ? 'Cliquez sur une étape du cycle pour voir la posture en 3D'
                    : 'Click any posture node in the cycle to inspect or open in 3D'}
                </span>
                <div className="flex items-center gap-1">
                  {DAILY_PRAYERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        appStore.dispatch({
                          type: 'SET_PRAYER',
                          prayerId: p.id,
                        })
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[30px] ${
                        activePrayerId === p.id
                          ? 'bg-[#0F5C4D] text-white'
                          : 'bg-[#F1EFEA] text-[#4A4D52] hover:bg-[#E5E0D8]'
                      }`}
                    >
                      {pickText(language, p.name)} ({p.rakahs})
                    </button>
                  ))}
                </div>
              </div>

              <svg
                viewBox="0 0 480 460"
                className="w-full h-auto max-h-[450px]"
                role="img"
                aria-label="Salah 10-Posture Cycle Diagram"
              >
                <defs>
                  <marker
                    id="cycleArrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#9A9488" />
                  </marker>
                </defs>

                {/* Curved Sequential Connectors */}
                {cycleNodes.map((node, i) => {
                  const next = cycleNodes[(i + 1) % cycleNodes.length];
                  const d = buildCurvedEdgePath(node, next, { x: cx, y: cy });
                  return (
                    <path
                      key={`edge-${node.id}`}
                      d={d}
                      fill="none"
                      stroke="#CFC9BE"
                      strokeWidth={1.75}
                      strokeDasharray={
                        i === cycleNodes.length - 1 ? '4 4' : undefined
                      }
                      markerEnd="url(#cycleArrow)"
                    />
                  );
                })}

                {/* Center Summary */}
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="600"
                  fill="#18191C"
                >
                  {pickText(
                    language,
                    DAILY_PRAYERS.find((p) => p.id === activePrayerId)?.name ??
                      DAILY_PRAYERS[1].name,
                  )}
                </text>
                <text
                  x={cx}
                  y={cy + 12}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#5D6066"
                  className="font-mono"
                >
                  {prayerSequence.length}{' '}
                  {language === 'fr' ? 'étapes totales' : 'total steps'}
                </text>

                {/* Posture Nodes */}
                {cycleNodes.map((node) => {
                  const step = getStepById(node.id);
                  const isActive = activeStepId === node.id;
                  const token = getCategoryColorToken(node.category);
                  return (
                    <g
                      key={node.id}
                      onClick={() =>
                        appStore.dispatch({ type: 'SET_STEP', stepId: node.id })
                      }
                      className="cursor-pointer"
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isActive ? 26 : 22}
                        fill={isActive ? '#0F5C4D' : '#FFFFFF'}
                        stroke={isActive ? '#0F5C4D' : token.stroke}
                        strokeWidth={isActive ? 2.5 : 1.75}
                      />
                      <text
                        x={node.x}
                        y={node.y - 1}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill={isActive ? '#FFFFFF' : '#18191C'}
                        className="font-mono select-none"
                      >
                        {String(node.order).padStart(2, '0')}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + 11}
                        textAnchor="middle"
                        fontSize="8.5"
                        fill={isActive ? '#D1FAE5' : '#5D6066'}
                        className="select-none"
                      >
                        {step.transliteration.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Right Concept & Ruling Inspector */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-2xl p-6 space-y-5">
          {mode === 'architecture' && (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-[#EAE5DC] pb-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#5D6066]">
                    <span
                      style={{
                        color: getCategoryColorToken(selectedRule.category)
                          .stroke,
                      }}
                    >
                      {getCategoryColorToken(selectedRule.category).glyph}
                    </span>{' '}
                    {pickText(language, UI_COPY.categories[selectedRule.category])}{' '}
                    · <span className="font-mono">#{selectedRule.index}</span>
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#18191C]">
                    {pickText(language, selectedRule.title)}
                  </h2>
                  <p className="text-xs text-[#5D6066]">
                    {selectedRule.transliteration}
                  </p>
                </div>
                <span className="font-arabic text-2xl text-[#0F5C4D] shrink-0">
                  {selectedRule.arabic}
                </span>
              </div>

              <p className="text-sm text-[#3E4147] leading-relaxed">
                {pickText(language, selectedRule.summary)}
              </p>

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1">
                  <p className="text-xs font-semibold text-[#991B1B]">
                    {pickText(language, UI_COPY.diagrams.simulateDeliberate)}
                  </p>
                  <p className="text-xs text-[#4A4D52] leading-relaxed">
                    {pickText(language, selectedRule.ifMissedDeliberately)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1">
                  <p className="text-xs font-semibold text-[#0F5C4D]">
                    {pickText(language, UI_COPY.diagrams.simulateForgetful)}
                  </p>
                  <p className="text-xs text-[#4A4D52] leading-relaxed">
                    {pickText(language, selectedRule.ifMissedForgetfully)}
                  </p>
                </div>
              </div>

              {selectedRule.linkedPostureId && (
                <button
                  type="button"
                  onClick={() => openStepIn3D(selectedRule.linkedPostureId!)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-[#0F5C4D] text-white text-sm font-medium hover:bg-[#0B493D] transition-colors"
                >
                  <Box className="w-4 h-4" />
                  <span>{pickText(language, UI_COPY.diagrams.inspectIn3d)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {mode === 'omission' && (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-[#EAE5DC] pb-4">
                <div>
                  <p className="text-xs text-[#5D6066]">
                    {pickText(language, UI_COPY.categories[selectedCategory])} ·{' '}
                    {omissionTiming === 'deliberate'
                      ? pickText(language, UI_COPY.diagrams.simulateDeliberate)
                      : pickText(language, UI_COPY.diagrams.simulateForgetful)}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#18191C] mt-1">
                    {pickText(language, omissionOutcome.badgeLabel)}
                  </h2>
                </div>
                {omissionOutcome.prayerValid ? (
                  <CheckCircle2 className="w-6 h-6 text-[#0F5C4D] shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#DC2626] shrink-0" />
                )}
              </div>

              <p className="text-sm text-[#3E4147] leading-relaxed">
                {pickText(language, omissionOutcome.rulingSummary)}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                  <p className="text-xs text-[#5D6066]">
                    {language === 'fr' ? 'Répéter l’acte' : 'Repeat Act'}
                  </p>
                  <p className="text-sm font-semibold text-[#18191C] mt-0.5">
                    {omissionOutcome.requiresRepeatAct
                      ? language === 'fr'
                        ? 'Oui, obligatoire'
                        : 'Yes, required'
                      : language === 'fr'
                        ? 'Non'
                        : 'No'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                  <p className="text-xs text-[#5D6066]">Sujud al-Sahw</p>
                  <p className="text-sm font-semibold text-[#18191C] mt-0.5">
                    {omissionOutcome.requiresSujudSahw
                      ? language === 'fr'
                        ? 'Oui, requis'
                        : 'Yes, required'
                      : language === 'fr'
                        ? 'Non applicable'
                        : 'Not applicable'}
                  </p>
                </div>
              </div>
            </>
          )}

          {mode === 'cycle' && (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-[#EAE5DC] pb-4">
                <div>
                  <p className="text-xs text-[#5D6066]">
                    {pickText(language, UI_COPY.categories[activeStep.category])} ·{' '}
                    <span className="font-mono">
                      {String(activeStep.order).padStart(2, '0')}/10
                    </span>
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#18191C] mt-1">
                    {pickText(language, activeStep.title)}
                  </h2>
                </div>
                <span className="font-arabic text-2xl text-[#0F5C4D] shrink-0">
                  {activeStep.arabicName}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1.5 text-center">
                <p className="font-arabic text-xl text-[#18191C]">
                  {activeStep.recitationArabic}
                </p>
                <p className="text-xs font-medium text-[#0F5C4D]">
                  {activeStep.recitationTranslit}
                </p>
                <p className="text-xs text-[#4A4D52]">
                  {pickText(language, activeStep.recitationMeaning)}
                </p>
              </div>

              <p className="text-sm text-[#3E4147] leading-relaxed">
                {pickText(language, activeStep.postureSummary)}
              </p>

              <button
                type="button"
                onClick={() => openStepIn3D(activeStep.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-[#0F5C4D] text-white text-sm font-medium hover:bg-[#0B493D] transition-colors"
              >
                <Box className="w-4 h-4" />
                <span>{pickText(language, UI_COPY.diagrams.inspectIn3d)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
