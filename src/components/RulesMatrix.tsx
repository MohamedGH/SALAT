import { Box, Check, CheckCircle2, CircleAlert, Search } from 'lucide-react';
import { getCategoryColorToken } from '../modules/diagrams/diagramLayout';
import { pickText, UI_COPY, type Language } from '../modules/i18n/translations';
import {
  calculateReadiness,
  filterRules,
} from '../modules/prayer/fiqhEngine';
import {
  ALL_FIQH_RULES,
  SHURUT_CONDITIONS,
  type FiqhCategory,
  type PostureId,
} from '../modules/prayer/prayerData';
import { syncBrowserHash } from '../modules/router/routeManager';
import { appStore, useAppSelector } from '../modules/state/store';

interface RulesMatrixProps {
  readonly language: Language;
}

export function RulesMatrix({ language }: RulesMatrixProps) {
  const filterCategory = useAppSelector((s) => s.matrixFilterCategory);
  const searchQuery = useAppSelector((s) => s.matrixSearchQuery);
  const checkedIds = useAppSelector((s) => s.checkedConditionIds);

  const filteredRules = filterRules(
    ALL_FIQH_RULES,
    filterCategory,
    searchQuery,
    language,
  );
  const readiness = calculateReadiness(checkedIds);

  const openStepIn3D = (stepId: PostureId) => {
    appStore.dispatch({ type: 'SET_STEP', stepId });
    const route = { name: 'guide' as const, stepId };
    appStore.dispatch({ type: 'NAVIGATE', route });
    syncBrowserHash(route);
  };

  const categories: readonly {
    readonly id: FiqhCategory | 'all';
    readonly label: string;
  }[] = [
    { id: 'all', label: pickText(language, UI_COPY.categories.all) },
    { id: 'condition', label: pickText(language, UI_COPY.categories.condition) },
    { id: 'pillar', label: pickText(language, UI_COPY.categories.pillar) },
    {
      id: 'obligation',
      label: pickText(language, UI_COPY.categories.obligation),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      <div className="space-y-1.5 border-b border-[#E5E0D8] pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#18191C]">
          {pickText(language, UI_COPY.matrix.title)}
        </h1>
        <p className="text-sm text-[#4A4D52] max-w-2xl">
          {pickText(language, UI_COPY.matrix.subtitle)}
        </p>
      </div>

      {/* Pre-Prayer 9-Condition Readiness Checklist */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-[#18191C]">
              {pickText(language, UI_COPY.matrix.readinessTitle)}
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium">
              {readiness.isReady ? (
                <span className="inline-flex items-center gap-1.5 text-[#0F5C4D]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pickText(language, UI_COPY.matrix.readyStatus)}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[#B45309]">
                  <CircleAlert className="w-4 h-4" />
                  <span>
                    {pickText(language, UI_COPY.matrix.notReadyStatus)}
                  </span>
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[#5D6066]">
                {readiness.completedCount}/{readiness.totalCount} (
                {readiness.percentage}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                appStore.dispatch({
                  type: 'SET_ALL_CONDITIONS_CHECKED',
                  ids: SHURUT_CONDITIONS.map((c) => c.id),
                })
              }
              className="px-3.5 py-2 min-h-[38px] rounded-lg bg-[#0F5C4D] text-white text-xs font-medium hover:bg-[#0B493D] transition-colors whitespace-nowrap shrink-0"
            >
              {pickText(language, UI_COPY.matrix.markAllReady)}
            </button>
            <button
              type="button"
              onClick={() =>
                appStore.dispatch({
                  type: 'SET_ALL_CONDITIONS_CHECKED',
                  ids: [],
                })
              }
              className="px-3.5 py-2 min-h-[38px] rounded-lg bg-[#F1EFEA] text-[#4A4D52] text-xs font-medium hover:bg-[#E5E0D8] transition-colors whitespace-nowrap shrink-0"
            >
              {pickText(language, UI_COPY.matrix.resetChecklist)}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-[#EFEAE0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F5C4D] transition-all duration-200"
            style={{ width: `${readiness.percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {SHURUT_CONDITIONS.map((cond) => {
            const isChecked = checkedIds.includes(cond.id);
            return (
              <button
                key={cond.id}
                type="button"
                onClick={() =>
                  appStore.dispatch({
                    type: 'TOGGLE_CONDITION_CHECK',
                    conditionId: cond.id,
                  })
                }
                className={`p-3 min-h-[48px] rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  isChecked
                    ? 'bg-[#ECFDF5] border-[#0F5C4D]/40 text-[#18191C]'
                    : 'bg-[#FAF8F5] border-[#EAE5DC] text-[#4A4D52] hover:border-[#D4CEC3]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                    isChecked
                      ? 'bg-[#0F5C4D] border-[#0F5C4D] text-white'
                      : 'bg-white border-[#C5BEB2]'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs font-medium truncate">
                  {cond.index}. {pickText(language, cond.title)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EAE5DC] rounded-xl self-start">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                appStore.dispatch({
                  type: 'SET_MATRIX_FILTER',
                  category: cat.id,
                })
              }
              className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filterCategory === cat.id
                  ? 'bg-white text-[#18191C] shadow-xs'
                  : 'text-[#55585E] hover:text-[#18191C]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6B6F76] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) =>
              appStore.dispatch({
                type: 'SET_MATRIX_SEARCH',
                query: e.target.value,
              })
            }
            placeholder={pickText(language, UI_COPY.matrix.searchPlaceholder)}
            className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl bg-white border border-[#E5E0D8] text-sm text-[#18191C] placeholder:text-[#787B82] focus:outline-none focus:border-[#0F5C4D]"
          />
        </div>
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-medium text-[#18191C]">
            {language === 'fr'
              ? 'Aucune règle ne correspond à votre recherche.'
              : 'No rules match your current filter.'}
          </p>
          <button
            type="button"
            onClick={() => {
              appStore.dispatch({ type: 'SET_MATRIX_FILTER', category: 'all' });
              appStore.dispatch({ type: 'SET_MATRIX_SEARCH', query: '' });
            }}
            className="px-4 py-2 min-h-[40px] rounded-lg bg-[#F1EFEA] text-xs font-medium text-[#18191C]"
          >
            {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule) => {
            const token = getCategoryColorToken(rule.category);
            return (
              <article
                key={rule.id}
                className="bg-white border border-[#E5E0D8] rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-[#5D6066]">
                        <span style={{ color: token.stroke }}>
                          {token.glyph}
                        </span>{' '}
                        {pickText(language, UI_COPY.categories[rule.category])} ·{' '}
                        <span className="font-mono tabular-nums">
                          #{rule.index}
                        </span>
                      </p>
                      <h3 className="font-display text-lg font-semibold text-[#18191C]">
                        {pickText(language, rule.title)}
                      </h3>
                      <p className="text-xs text-[#5D6066]">
                        {rule.transliteration}
                      </p>
                    </div>
                    <span className="font-arabic text-xl text-[#0F5C4D] shrink-0">
                      {rule.arabic}
                    </span>
                  </div>

                  <p className="text-sm text-[#3E4147] leading-relaxed">
                    {pickText(language, rule.summary)}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE5DC] space-y-2 text-xs">
                  <p className="text-[#4A4D52]">
                    <span className="font-semibold text-[#991B1B]">
                      {language === 'fr' ? 'Volontaire :' : 'Deliberate:'}
                    </span>{' '}
                    {pickText(language, rule.ifMissedDeliberately)}
                  </p>
                  <p className="text-[#4A4D52]">
                    <span className="font-semibold text-[#0F5C4D]">
                      {language === 'fr' ? 'Oubli :' : 'Forgetful:'}
                    </span>{' '}
                    {pickText(language, rule.ifMissedForgetfully)}
                  </p>

                  {rule.linkedPostureId && (
                    <button
                      type="button"
                      onClick={() => openStepIn3D(rule.linkedPostureId!)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#0F5C4D] hover:underline min-h-[36px]"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>
                        {pickText(language, UI_COPY.diagrams.inspectIn3d)}
                      </span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
