import { describe, expect, it, vi } from 'vitest';
import { createAppError } from '../modules/errors/errorManager';
import {
  appReducer,
  createInitialState,
  createStore,
} from '../modules/state/store';

describe('stateManager', () => {
  it('steps forward and backward cleanly across all 10 prayer postures', () => {
    const store = createStore(
      appReducer,
      createInitialState({
        route: { name: 'guide', stepId: 'qiyam_ready' },
        activeStepId: 'qiyam_ready',
      }),
    );

    store.dispatch({ type: 'PREV_STEP' });
    expect(store.getState().activeStepId).toBe('taslim');
    expect(store.getState().route).toEqual({
      name: 'guide',
      stepId: 'taslim',
    });

    store.dispatch({ type: 'NEXT_STEP' });
    expect(store.getState().activeStepId).toBe('qiyam_ready');
  });

  it('notifies subscribers on state changes and supports unsubscribe', () => {
    const store = createStore(appReducer, createInitialState());
    const listener = vi.fn();
    const unsub = store.subscribe(listener);

    store.dispatch({ type: 'SET_LANGUAGE', language: 'fr' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().language).toBe('fr');

    unsub();
    store.dispatch({ type: 'TOGGLE_PLAY_3D' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().isPlaying3D).toBe(true);
  });

  it('toggles pre-prayer condition checklist items and manages errors immutably', () => {
    const store = createStore(
      appReducer,
      createInitialState({ checkedConditionIds: ['shart-1'] }),
    );

    store.dispatch({ type: 'TOGGLE_CONDITION_CHECK', conditionId: 'shart-4' });
    expect(store.getState().checkedConditionIds).toEqual([
      'shart-1',
      'shart-4',
    ]);

    store.dispatch({ type: 'TOGGLE_CONDITION_CHECK', conditionId: 'shart-1' });
    expect(store.getState().checkedConditionIds).toEqual(['shart-4']);

    const errItem = createAppError('WEBGL_UNAVAILABLE', 'No WebGL', 'Pas WebGL');
    store.dispatch({ type: 'REPORT_ERROR', error: errItem });
    expect(store.getState().errorState.activeErrors).toHaveLength(1);

    store.dispatch({ type: 'DISMISS_ERROR', id: errItem.id });
    expect(store.getState().errorState.activeErrors).toHaveLength(0);

    expect(store.getState().showSceneRecitation).toBe(true);
    store.dispatch({ type: 'TOGGLE_SCENE_RECITATION' });
    expect(store.getState().showSceneRecitation).toBe(false);
  });
});
