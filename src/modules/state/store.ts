import { useSyncExternalStore } from 'react';
import {
  appendError,
  clearAllErrors,
  dismissErrorById,
  initialErrorState,
  type AppError,
  type ErrorManagerState,
} from '../errors/errorManager';
import type { Language } from '../i18n/translations';
import {
  PRAYER_STEPS,
  type DailyPrayerDefinition,
  type FiqhCategory,
  type PostureId,
} from '../prayer/prayerData';
import type { OmissionTiming } from '../prayer/fiqhEngine';
import type { AppRoute } from '../router/routeManager';

export type DiagramMode = 'architecture' | 'omission' | 'cycle';
export type CameraPreset = 'threeQuarter' | 'profile' | 'top' | 'closeUp';

export interface AppState {
  readonly route: AppRoute;
  readonly language: Language;
  readonly activeStepId: PostureId;
  readonly activePrayerId: DailyPrayerDefinition['id'];
  readonly isPlaying3D: boolean;
  readonly playbackSpeed: 0.5 | 1 | 1.5;
  readonly cameraPreset: CameraPreset;
  readonly showAlignmentGuides: boolean;
  readonly showSceneRecitation: boolean;
  readonly controlsCollapsed: boolean;
  readonly diagramMode: DiagramMode;
  readonly selectedDiagramCategory: FiqhCategory;
  readonly omissionTiming: OmissionTiming;
  readonly selectedRuleId: string;
  readonly matrixFilterCategory: FiqhCategory | 'all';
  readonly matrixSearchQuery: string;
  readonly checkedConditionIds: readonly string[];
  readonly webglSupported: boolean;
  readonly errorState: ErrorManagerState;
}

export type AppAction =
  | { readonly type: 'NAVIGATE'; readonly route: AppRoute }
  | { readonly type: 'SET_LANGUAGE'; readonly language: Language }
  | { readonly type: 'SET_STEP'; readonly stepId: PostureId }
  | { readonly type: 'NEXT_STEP' }
  | { readonly type: 'PREV_STEP' }
  | { readonly type: 'SET_PRAYER'; readonly prayerId: DailyPrayerDefinition['id'] }
  | { readonly type: 'TOGGLE_PLAY_3D'; readonly playing?: boolean }
  | { readonly type: 'SET_PLAYBACK_SPEED'; readonly speed: 0.5 | 1 | 1.5 }
  | { readonly type: 'SET_CAMERA_PRESET'; readonly preset: CameraPreset }
  | { readonly type: 'TOGGLE_ALIGNMENT_GUIDES' }
  | { readonly type: 'TOGGLE_SCENE_RECITATION' }
  | { readonly type: 'TOGGLE_CONTROLS_COLLAPSED' }
  | { readonly type: 'SET_DIAGRAM_MODE'; readonly mode: DiagramMode }
  | { readonly type: 'SET_DIAGRAM_CATEGORY'; readonly category: FiqhCategory }
  | { readonly type: 'SET_OMISSION_TIMING'; readonly timing: OmissionTiming }
  | { readonly type: 'SET_SELECTED_RULE'; readonly ruleId: string }
  | { readonly type: 'SET_MATRIX_FILTER'; readonly category: FiqhCategory | 'all' }
  | { readonly type: 'SET_MATRIX_SEARCH'; readonly query: string }
  | { readonly type: 'TOGGLE_CONDITION_CHECK'; readonly conditionId: string }
  | { readonly type: 'SET_ALL_CONDITIONS_CHECKED'; readonly ids: readonly string[] }
  | { readonly type: 'SET_WEBGL_SUPPORTED'; readonly supported: boolean }
  | { readonly type: 'REPORT_ERROR'; readonly error: AppError }
  | { readonly type: 'DISMISS_ERROR'; readonly id: string }
  | { readonly type: 'CLEAR_ERRORS' };

export const createInitialState = (
  overrides?: Partial<AppState>,
): AppState => ({
  route: { name: 'overview' },
  language: 'en',
  activeStepId: 'qiyam_ready',
  activePrayerId: 'dhuhr',
  isPlaying3D: false,
  playbackSpeed: 1,
  cameraPreset: 'threeQuarter',
  showAlignmentGuides: true,
  showSceneRecitation: true,
  controlsCollapsed: false,
  diagramMode: 'architecture',
  selectedDiagramCategory: 'pillar',
  omissionTiming: 'forgetful',
  selectedRuleId: 'rukn-4',
  matrixFilterCategory: 'all',
  matrixSearchQuery: '',
  checkedConditionIds: ['shart-1', 'shart-2', 'shart-3'],
  webglSupported: true,
  errorState: initialErrorState,
  ...overrides,
});

const getNextStepId = (currentId: PostureId, delta: 1 | -1): PostureId => {
  const idx = PRAYER_STEPS.findIndex((s) => s.id === currentId);
  const safeIdx = idx === -1 ? 0 : idx;
  const nextIdx =
    (safeIdx + delta + PRAYER_STEPS.length) % PRAYER_STEPS.length;
  return PRAYER_STEPS[nextIdx].id;
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'NAVIGATE': {
      const nextStepId = action.route.stepId ?? state.activeStepId;
      const nextDiagramMode = action.route.diagramMode ?? state.diagramMode;
      return {
        ...state,
        route: action.route,
        activeStepId: nextStepId,
        diagramMode: nextDiagramMode,
      };
    }
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'SET_STEP':
      return {
        ...state,
        activeStepId: action.stepId,
        route:
          state.route.name === 'guide'
            ? { name: 'guide', stepId: action.stepId }
            : state.route,
      };
    case 'NEXT_STEP': {
      const nextId = getNextStepId(state.activeStepId, 1);
      return {
        ...state,
        activeStepId: nextId,
        route:
          state.route.name === 'guide'
            ? { name: 'guide', stepId: nextId }
            : state.route,
      };
    }
    case 'PREV_STEP': {
      const prevId = getNextStepId(state.activeStepId, -1);
      return {
        ...state,
        activeStepId: prevId,
        route:
          state.route.name === 'guide'
            ? { name: 'guide', stepId: prevId }
            : state.route,
      };
    }
    case 'SET_PRAYER':
      return { ...state, activePrayerId: action.prayerId };
    case 'TOGGLE_PLAY_3D':
      return {
        ...state,
        isPlaying3D:
          action.playing !== undefined ? action.playing : !state.isPlaying3D,
      };
    case 'SET_PLAYBACK_SPEED':
      return { ...state, playbackSpeed: action.speed };
    case 'SET_CAMERA_PRESET':
      return { ...state, cameraPreset: action.preset };
    case 'TOGGLE_ALIGNMENT_GUIDES':
      return { ...state, showAlignmentGuides: !state.showAlignmentGuides };
    case 'TOGGLE_SCENE_RECITATION':
      return { ...state, showSceneRecitation: !state.showSceneRecitation };
    case 'TOGGLE_CONTROLS_COLLAPSED':
      return { ...state, controlsCollapsed: !state.controlsCollapsed };
    case 'SET_DIAGRAM_MODE':
      return {
        ...state,
        diagramMode: action.mode,
        route:
          state.route.name === 'diagrams'
            ? { name: 'diagrams', diagramMode: action.mode }
            : state.route,
      };
    case 'SET_DIAGRAM_CATEGORY':
      return { ...state, selectedDiagramCategory: action.category };
    case 'SET_OMISSION_TIMING':
      return { ...state, omissionTiming: action.timing };
    case 'SET_SELECTED_RULE':
      return { ...state, selectedRuleId: action.ruleId };
    case 'SET_MATRIX_FILTER':
      return { ...state, matrixFilterCategory: action.category };
    case 'SET_MATRIX_SEARCH':
      return { ...state, matrixSearchQuery: action.query };
    case 'TOGGLE_CONDITION_CHECK': {
      const exists = state.checkedConditionIds.includes(action.conditionId);
      const nextIds = exists
        ? state.checkedConditionIds.filter((id) => id !== action.conditionId)
        : [...state.checkedConditionIds, action.conditionId];
      return { ...state, checkedConditionIds: nextIds };
    }
    case 'SET_ALL_CONDITIONS_CHECKED':
      return { ...state, checkedConditionIds: [...action.ids] };
    case 'SET_WEBGL_SUPPORTED':
      return { ...state, webglSupported: action.supported };
    case 'REPORT_ERROR':
      return {
        ...state,
        errorState: appendError(state.errorState, action.error),
      };
    case 'DISMISS_ERROR':
      return {
        ...state,
        errorState: dismissErrorById(state.errorState, action.id),
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errorState: clearAllErrors(state.errorState),
      };
  }
};

export interface Store<S, A> {
  readonly getState: () => S;
  readonly dispatch: (action: A) => void;
  readonly subscribe: (listener: () => void) => () => void;
}

export const createStore = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): Store<S, A> => {
  let currentState = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => currentState,
    dispatch: (action: A) => {
      const nextState = reducer(currentState, action);
      if (!Object.is(nextState, currentState)) {
        currentState = nextState;
        listeners.forEach((listener) => listener());
      }
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const appStore = createStore(appReducer, createInitialState());

export const useAppSelector = <T>(selector: (state: AppState) => T): T =>
  useSyncExternalStore(
    appStore.subscribe,
    () => selector(appStore.getState()),
    () => selector(appStore.getState()),
  );
