import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import {
  normalizeUnknownError,
  type AppError,
} from '../modules/errors/errorManager';
import { pickText, UI_COPY, type Language } from '../modules/i18n/translations';
import { appStore, useAppSelector } from '../modules/state/store';

interface BoundaryProps {
  readonly children: React.ReactNode;
}

interface BoundaryState {
  readonly hasError: boolean;
  readonly error: AppError | null;
}

export class AppErrorBoundary extends React.Component<
  BoundaryProps,
  BoundaryState
> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(caught: unknown): BoundaryState {
    return {
      hasError: true,
      error: normalizeUnknownError(caught),
    };
  }

  componentDidCatch(caught: unknown): void {
    appStore.dispatch({
      type: 'REPORT_ERROR',
      error: normalizeUnknownError(caught),
    });
  }

  private handleRecover = () => {
    this.setState({ hasError: false, error: null });
    appStore.dispatch({ type: 'CLEAR_ERRORS' });
    appStore.dispatch({ type: 'NAVIGATE', route: { name: 'overview' } });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E5E0D8] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#B45309]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-semibold text-[#18191C]">
                Recoverable Application Error
              </h2>
            </div>
            <p className="text-sm text-[#4A4D52] leading-relaxed">
              {this.state.error?.message ??
                'An unexpected rendering issue occurred.'}
            </p>
            <button
              type="button"
              onClick={this.handleRecover}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-[#0F5C4D] text-white text-sm font-medium hover:bg-[#0B493D] transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Return to Overview</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBanner({ language }: { readonly language: Language }) {
  const activeErrors = useAppSelector((s) => s.errorState.activeErrors);

  if (activeErrors.length === 0) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 space-y-2"
    >
      {activeErrors.map((errItem) => {
        const text = language === 'fr' ? errItem.messageFr : errItem.message;
        return (
          <div
            key={errItem.id}
            className="flex items-center justify-between gap-4 bg-white border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
              <span className="font-mono text-xs text-[#6B6F76] shrink-0">
                {errItem.code}
              </span>
              <span className="text-[#18191C] truncate">{text}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                appStore.dispatch({ type: 'DISMISS_ERROR', id: errItem.id })
              }
              aria-label={pickText(language, UI_COPY.errors.dismiss)}
              className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-[#6B6F76] hover:text-[#18191C] hover:bg-[#F1EFEA] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
