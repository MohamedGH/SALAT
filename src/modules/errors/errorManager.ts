export type ErrorCode =
  | 'ROUTE_NOT_FOUND'
  | 'WEBGL_UNAVAILABLE'
  | 'WEBGL_CONTEXT_LOST'
  | 'INVALID_STEP'
  | 'VALIDATION_ERROR'
  | 'UNEXPECTED_ERROR';

export type ErrorSeverity = 'info' | 'warning' | 'critical';

export interface AppError {
  readonly id: string;
  readonly code: ErrorCode;
  readonly message: string;
  readonly messageFr: string;
  readonly severity: ErrorSeverity;
  readonly recoverable: boolean;
  readonly context?: Record<string, string | number | boolean>;
  readonly timestamp: number;
}

export type Result<T, E = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

export const err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (result.ok ? ok(fn(result.value)) : result);

export const flatMapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => (result.ok ? fn(result.value) : result);

export const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T =>
  result.ok ? result.value : fallback;

export const createAppError = (
  code: ErrorCode,
  message: string,
  messageFr: string,
  options?: {
    readonly severity?: ErrorSeverity;
    readonly recoverable?: boolean;
    readonly context?: Record<string, string | number | boolean>;
    readonly now?: number;
  },
): AppError => {
  const timestamp = options?.now ?? Date.now();
  return {
    id: `${code}-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    code,
    message,
    messageFr,
    severity: options?.severity ?? 'warning',
    recoverable: options?.recoverable ?? true,
    context: options?.context,
    timestamp,
  };
};

export const tryCatch = <T>(
  fn: () => T,
  onError: (caught: unknown) => AppError,
): Result<T, AppError> => {
  try {
    return ok(fn());
  } catch (caught) {
    return err(onError(caught));
  }
};

export const normalizeUnknownError = (caught: unknown): AppError => {
  if (caught instanceof Error) {
    return createAppError(
      'UNEXPECTED_ERROR',
      caught.message || 'An unexpected error occurred.',
      caught.message || 'Une erreur inattendue est survenue.',
      { severity: 'critical', recoverable: true },
    );
  }
  return createAppError(
    'UNEXPECTED_ERROR',
    'An unexpected error occurred.',
    'Une erreur inattendue est survenue.',
    { severity: 'critical', recoverable: true },
  );
};

export interface ErrorManagerState {
  readonly activeErrors: readonly AppError[];
  readonly historyCount: number;
}

export const initialErrorState: ErrorManagerState = {
  activeErrors: [],
  historyCount: 0,
};

export const appendError = (
  state: ErrorManagerState,
  error: AppError,
  maxActive = 4,
): ErrorManagerState => {
  const deduped = state.activeErrors.filter((e) => e.code !== error.code);
  const nextActive = [...deduped, error].slice(-maxActive);
  return {
    activeErrors: nextActive,
    historyCount: state.historyCount + 1,
  };
};

export const dismissErrorById = (
  state: ErrorManagerState,
  id: string,
): ErrorManagerState => ({
  ...state,
  activeErrors: state.activeErrors.filter((e) => e.id !== id),
});

export const clearAllErrors = (state: ErrorManagerState): ErrorManagerState => ({
  ...state,
  activeErrors: [],
});
