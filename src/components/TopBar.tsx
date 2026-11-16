import { BookOpen, Box, Compass, Network } from 'lucide-react';
import { pickText, UI_COPY, type Language } from '../modules/i18n/translations';
import { syncBrowserHash, type RouteName } from '../modules/router/routeManager';
import { appStore } from '../modules/state/store';

interface TopBarProps {
  readonly activeRoute: RouteName;
  readonly language: Language;
}

const navigate = (name: RouteName) => {
  const route =
    name === 'guide'
      ? { name: 'guide' as const, stepId: appStore.getState().activeStepId }
      : name === 'diagrams'
        ? {
            name: 'diagrams' as const,
            diagramMode: appStore.getState().diagramMode,
          }
        : { name };
  appStore.dispatch({ type: 'NAVIGATE', route });
  syncBrowserHash(route);
};

export function TopBar({ activeRoute, language }: TopBarProps) {
  const navItems: readonly {
    readonly id: RouteName;
    readonly label: string;
  }[] = [
    { id: 'overview', label: pickText(language, UI_COPY.nav.overview) },
    { id: 'diagrams', label: pickText(language, UI_COPY.nav.diagrams) },
    { id: 'guide', label: pickText(language, UI_COPY.nav.guide3d) },
    { id: 'matrix', label: pickText(language, UI_COPY.nav.matrix) },
  ];

  return (
    <header className="bg-[#F8F7F4] border-b border-[#E5E0D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#/overview"
          onClick={(e) => {
            e.preventDefault();
            navigate('overview');
          }}
          className="font-display text-2xl font-semibold tracking-tight text-[#18191C] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C4D] rounded"
        >
          {pickText(language, UI_COPY.brand)}
        </a>

        {/* Zone 2: 4 Clean Single-Line Text Nav Links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <a
                key={item.id}
                href={`#/${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.id);
                }}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C4D] rounded-t ${
                  isActive
                    ? 'border-[#0F5C4D] text-[#0F5C4D]'
                    : 'border-transparent text-[#55585E] hover:text-[#18191C] hover:border-[#D4CEC3]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => navigate('guide')}
            className="px-4 py-2 min-h-[40px] rounded-lg bg-[#0F5C4D] text-white text-sm font-medium hover:bg-[#0B493D] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F5C4D]"
          >
            {pickText(language, UI_COPY.cta.start3d)}
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav({
  activeRoute,
  language,
}: TopBarProps) {
  const items: readonly {
    readonly id: RouteName;
    readonly label: string;
    readonly icon: typeof Compass;
  }[] = [
    {
      id: 'overview',
      label: pickText(language, UI_COPY.nav.overview),
      icon: Compass,
    },
    {
      id: 'diagrams',
      label: pickText(language, UI_COPY.nav.diagrams),
      icon: Network,
    },
    {
      id: 'guide',
      label: pickText(language, UI_COPY.nav.guide3d),
      icon: Box,
    },
    {
      id: 'matrix',
      label: pickText(language, UI_COPY.nav.matrix),
      icon: BookOpen,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#E5E0D8]"
    >
      <div className="grid grid-cols-4 h-14">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-[#0F5C4D] font-semibold' : 'text-[#5D6066]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] leading-none whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
