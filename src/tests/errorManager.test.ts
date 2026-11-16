import { describe, expect, it } from 'vitest';
import {
  appendError,
  clearAllErrors,
  createAppError,
  dismissErrorById,
  err,
  flatMapResult,
  initialErrorState,
  mapResult,
  normalizeUnknownError,
  ok,
  tryCatch,
  unwrapOr,
} from '../modules/errors/errorManager';

describe('errorManager', () => {
  it('supports Result ADT helpers (ok, err, mapResult, flatMapResult, unwrapOr)', () => {
    const success = ok(10);
    const doubled = mapResult(success, (n) => n * 2);
    expect(doubled).toEqual({ ok: true, value: 20 });

    const chained = flatMapResult(doubled, (n) =>
      n > 15 ? ok(n + 5) : err(createAppError('VALIDATION_ERROR', 'low', 'bas')),
    );
    expect(chained).toEqual({ ok: true, value: 25 });
    expect(unwrapOr(chained, 0)).toBe(25);

    const failure = err(createAppError('ROUTE_NOT_FOUND', 'missing', 'absent'));
    expect(mapResult(failure, (n: number) => n + 1)).toEqual(failure);
    expect(unwrapOr(failure, 99)).toBe(99);
  });

  it('captures thrown exceptions cleanly via tryCatch and normalizeUnknownError', () => {
    const resOk = tryCatch(() => JSON.parse('{"a":1}'), normalizeUnknownError);
    expect(resOk).toEqual({ ok: true, value: { a: 1 } });

    const resErr = tryCatch(() => {
      throw new Error('Boom');
    }, normalizeUnknownError);
    expect(resErr.ok).toBe(false);
    if (!resErr.ok) {
      expect(resErr.error.code).toBe('UNEXPECTED_ERROR');
      expect(resErr.error.message).toBe('Boom');
    }

    const nonError = normalizeUnknownError('raw string error');
    expect(nonError.code).toBe('UNEXPECTED_ERROR');
  });

  it('deduplicates error codes, caps active errors, dismisses, and clears', () => {
    const e1 = createAppError('ROUTE_NOT_FOUND', 'm1', 'f1', { now: 1 });
    const e2 = createAppError('ROUTE_NOT_FOUND', 'm2', 'f2', { now: 2 });
    const e3 = createAppError('WEBGL_UNAVAILABLE', 'm3', 'f3', { now: 3 });

    let state = appendError(initialErrorState, e1, 2);
    state = appendError(state, e2, 2);
    expect(state.activeErrors).toHaveLength(1);
    expect(state.activeErrors[0].message).toBe('m2');
    expect(state.historyCount).toBe(2);

    state = appendError(state, e3, 2);
    expect(state.activeErrors).toHaveLength(2);

    state = dismissErrorById(state, e2.id);
    expect(state.activeErrors).toHaveLength(1);
    expect(state.activeErrors[0].id).toBe(e3.id);

    state = clearAllErrors(state);
    expect(state.activeErrors).toHaveLength(0);
  });
});
