import { useEffect } from 'react';
import { AppErrorBoundary, ErrorBanner } from './components/ErrorBoundary';
import { InteractiveDiagrams } from './components/InteractiveDiagrams';
import { OverviewSection } from './components/OverviewSection';
import { PostureGuide3D } from './components/PostureGuide3D';
import { RulesMatrix } from './components/RulesMatrix';
import { MobileBottomNav, TopBar } from './components/TopBar';
import { pickText, UI_COPY } from './modules/i18n/translations';
import {
  parseHashRoute,
  syncBrowserHash,
} from './modules/router/routeManager';
import { appStore, useAppSelector } from './modules/state/store';

function AppShell() {
  const route = useAppSelector((s) => s.route);
  const language = useAppSelector((s) => s.language);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash;
      if (!hash) {
        return;
      }
      const parsed = parseHashRoute(hash);
      if (parsed.ok) {
        appStore.dispatch({ type: 'NAVIGATE', route: parsed.value });
      } else {
        appStore.dispatch({ type: 'REPORT_ERROR', error: parsed.error });
        const fallbackRoute = { name: 'overview' as const };
        appStore.dispatch({ type: 'NAVIGATE', route: fallbackRoute });
        syncBrowserHash(fallbackRoute);
      }
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#18191C] pb-16 md:pb-0">
      <TopBar activeRoute={route.name} language={language} />
      <ErrorBanner language={language} />

      <main className="flex-1">
        {route.name === 'overview' && (
          <>
            <OverviewSection language={language} />
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE5DC] pb-4">
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#18191C]">
                    {language === 'fr'
                      ? 'Comparatif Rapide : Conditions, Piliers, Obligations & Sunan'
                      : 'At-a-Glance Comparison: Conditions, Pillars, Obligations & Sunan'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      const next = {
                        name: 'diagrams' as const,
                        diagramMode: 'omission' as const,
                      };
                      appStore.dispatch({ type: 'NAVIGATE', route: next });
                      syncBrowserHash(next);
                    }}
                    className="text-xs font-medium text-[#0F5C4D] hover:underline self-start sm:self-auto whitespace-nowrap shrink-0"
                  >
                    {language === 'fr'
                      ? 'Simuler dans le diagramme d’oubli →'
                      : 'Simulate in Omission Diagram →'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#EAE5DC] text-xs text-[#5D6066]">
                        <th className="py-3 pr-4 font-medium">
                          {language === 'fr' ? 'Catégorie' : 'Classification'}
                        </th>
                        <th className="py-3 px-4 font-medium">
                          {language === 'fr' ? 'Moment' : 'Timing'}
                        </th>
                        <th className="py-3 px-4 font-medium">
                          {language === 'fr'
                            ? 'Si Omis Volontairement'
                            : 'If Missed Deliberately'}
                        </th>
                        <th className="py-3 pl-4 font-medium">
                          {language === 'fr'
                            ? 'Si Omis par Oubli'
                            : 'If Missed Forgetfully'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1EFEA] text-xs sm:text-sm">
                      <tr>
                        <td className="py-3.5 pr-4 font-medium text-[#0369A1] whitespace-nowrap">
                          ◆ {pickText(language, UI_COPY.categories.condition)}
                        </td>
                        <td className="py-3.5 px-4 text-[#4A4D52]">
                          {language === 'fr'
                            ? 'Avant la prière'
                            : 'Before Salah'}
                        </td>
                        <td className="py-3.5 px-4 text-[#991B1B]">
                          {language === 'fr' ? 'Invalide' : 'Prayer invalid'}
                        </td>
                        <td className="py-3.5 pl-4 text-[#991B1B]">
                          {language === 'fr'
                            ? 'Invalide (à refaire)'
                            : 'Invalid (repeat prayer)'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 pr-4 font-medium text-[#0F5C4D] whitespace-nowrap">
                          ● {pickText(language, UI_COPY.categories.pillar)}
                        </td>
                        <td className="py-3.5 px-4 text-[#4A4D52]">
                          {language === 'fr'
                            ? 'Dans la prière'
                            : 'Inside Salah'}
                        </td>
                        <td className="py-3.5 px-4 text-[#991B1B]">
                          {language === 'fr' ? 'Invalide' : 'Prayer invalid'}
                        </td>
                        <td className="py-3.5 pl-4 text-[#0F5C4D]">
                          {language === 'fr'
                            ? 'Rattraper le pilier + Sujud Sahw'
                            : 'Perform pillar + Sujud Sahw'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 pr-4 font-medium text-[#B45309] whitespace-nowrap">
                          ▲ {pickText(language, UI_COPY.categories.obligation)}
                        </td>
                        <td className="py-3.5 px-4 text-[#4A4D52]">
                          {language === 'fr'
                            ? 'Dans la prière'
                            : 'Inside Salah'}
                        </td>
                        <td className="py-3.5 px-4 text-[#991B1B]">
                          {language === 'fr' ? 'Invalide' : 'Prayer invalid'}
                        </td>
                        <td className="py-3.5 pl-4 text-[#0F5C4D]">
                          {language === 'fr'
                            ? 'Valide avec Sujud al-Sahw'
                            : 'Repaired via Sujud al-Sahw'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 pr-4 font-medium text-[#475569] whitespace-nowrap">
                          ○ {pickText(language, UI_COPY.categories.sunnah)}
                        </td>
                        <td className="py-3.5 px-4 text-[#4A4D52]">
                          {language === 'fr'
                            ? 'Dans la prière'
                            : 'Inside Salah'}
                        </td>
                        <td className="py-3.5 px-4 text-[#4A4D52]">
                          {language === 'fr'
                            ? 'Valide (récompense moindre)'
                            : 'Valid (reduced reward)'}
                        </td>
                        <td className="py-3.5 pl-4 text-[#4A4D52]">
                          {language === 'fr'
                            ? 'Valide sans Sujud Sahw'
                            : 'Valid without Sujud Sahw'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}

        {route.name === 'diagrams' && (
          <InteractiveDiagrams language={language} />
        )}
        {route.name === 'guide' && <PostureGuide3D language={language} />}
        {route.name === 'matrix' && <RulesMatrix language={language} />}
      </main>

      <footer className="border-t border-[#E5E0D8] bg-[#F8F7F4] py-6 px-4 sm:px-6 text-xs text-[#5D6066]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Mihrab ·{' '}
            {language === 'fr'
              ? 'Guide Éducatif de la Prière (Shurut, Arkan, Wajibat & Postures 3D)'
              : 'Educational Salah Guide (Shurut, Arkan, Wajibat & 3D Postures)'}
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                appStore.dispatch({
                  type: 'SET_LANGUAGE',
                  language: language === 'en' ? 'fr' : 'en',
                })
              }
              className="hover:text-[#18191C] underline-offset-4 hover:underline"
            >
              {language === 'en' ? 'Passer en Français' : 'Switch to English'}
            </button>
          </div>
        </div>
      </footer>

      <MobileBottomNav activeRoute={route.name} language={language} />
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppShell />
    </AppErrorBoundary>
  );
}
