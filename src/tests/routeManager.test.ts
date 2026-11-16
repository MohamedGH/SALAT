import { describe, expect, it } from 'vitest';
import {
  buildHashFromRoute,
  isValidPostureId,
  parseHashRoute,
} from '../modules/router/routeManager';

describe('routeManager', () => {
  it('parses empty and standard routes accurately', () => {
    expect(parseHashRoute('')).toEqual({ ok: true, value: { name: 'overview' } });
    expect(parseHashRoute('#/overview')).toEqual({
      ok: true,
      value: { name: 'overview' },
    });
    expect(parseHashRoute('#/diagrams/omission')).toEqual({
      ok: true,
      value: { name: 'diagrams', diagramMode: 'omission' },
    });
    expect(parseHashRoute('#/guide/ruku')).toEqual({
      ok: true,
      value: { name: 'guide', stepId: 'ruku' },
    });
    expect(parseHashRoute('#/matrix')).toEqual({
      ok: true,
      value: { name: 'matrix' },
    });
  });

  it('returns typed AppError for unknown routes, diagram modes, and invalid posture steps', () => {
    const badRoute = parseHashRoute('#/unknown-page');
    expect(badRoute.ok).toBe(false);
    if (!badRoute.ok) {
      expect(badRoute.error.code).toBe('ROUTE_NOT_FOUND');
    }

    const badStep = parseHashRoute('#/guide/nonexistent_pose');
    expect(badStep.ok).toBe(false);
    if (!badStep.ok) {
      expect(badStep.error.code).toBe('INVALID_STEP');
    }

    const badMode = parseHashRoute('#/diagrams/3d_matrix');
    expect(badMode.ok).toBe(false);
    if (!badMode.ok) {
      expect(badMode.error.code).toBe('ROUTE_NOT_FOUND');
    }
  });

  it('serializes routes back to canonical hash URLs and validates posture IDs', () => {
    expect(buildHashFromRoute({ name: 'overview' })).toBe('#/overview');
    expect(
      buildHashFromRoute({ name: 'diagrams', diagramMode: 'cycle' }),
    ).toBe('#/diagrams/cycle');
    expect(buildHashFromRoute({ name: 'guide', stepId: 'sujud_1' })).toBe(
      '#/guide/sujud_1',
    );
    expect(buildHashFromRoute({ name: 'matrix' })).toBe('#/matrix');

    expect(isValidPostureId('taslim')).toBe(true);
    expect(isValidPostureId('invalid')).toBe(false);
  });
});
