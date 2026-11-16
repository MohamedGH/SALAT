import {
  createAppError,
  err,
  ok,
  type AppError,
  type Result,
} from '../errors/errorManager';
import { PRAYER_STEPS, type PostureId } from '../prayer/prayerData';

export type RouteName = 'overview' | 'diagrams' | 'guide' | 'matrix';

export interface AppRoute {
  readonly name: RouteName;
  readonly stepId?: PostureId;
  readonly diagramMode?: 'architecture' | 'omission' | 'cycle';
}

const VALID_STEP_IDS = new Set<string>(PRAYER_STEPS.map((s) => s.id));
const VALID_DIAGRAM_MODES = new Set<string>([
  'architecture',
  'omission',
  'cycle',
]);

export const isValidPostureId = (value: string): value is PostureId =>
  VALID_STEP_IDS.has(value);

export const parseHashRoute = (rawHash: string): Result<AppRoute, AppError> => {
  const cleaned = rawHash.replace(/^#\/?/, '').trim();
  if (!cleaned) {
    return ok({ name: 'overview' });
  }

  const parts = cleaned.split('/').filter(Boolean);
  const head = parts[0]?.toLowerCase();

  switch (head) {
    case 'overview':
      return ok({ name: 'overview' });
    case 'diagrams': {
      const mode = parts[1];
      if (!mode) {
        return ok({ name: 'diagrams', diagramMode: 'architecture' });
      }
      if (VALID_DIAGRAM_MODES.has(mode)) {
        return ok({
          name: 'diagrams',
          diagramMode: mode as AppRoute['diagramMode'],
        });
      }
      return err(
        createAppError(
          'ROUTE_NOT_FOUND',
          `Unknown diagram mode "${mode}". Showing Architecture diagram.`,
          `Mode de diagramme inconnu « ${mode} ». Affichage de l’architecture.`,
          { severity: 'info', context: { rawHash } },
        ),
      );
    }
    case 'guide': {
      const stepParam = parts[1];
      if (!stepParam) {
        return ok({ name: 'guide', stepId: 'qiyam_ready' });
      }
      if (isValidPostureId(stepParam)) {
        return ok({ name: 'guide', stepId: stepParam });
      }
      return err(
        createAppError(
          'INVALID_STEP',
          `Unknown posture step "${stepParam}". Reset to Qiyam.`,
          `Posture inconnue « ${stepParam} ». Retour à Qiyam.`,
          { severity: 'warning', context: { stepParam } },
        ),
      );
    }
    case 'matrix':
      return ok({ name: 'matrix' });
    default:
      return err(
        createAppError(
          'ROUTE_NOT_FOUND',
          `Route "#/${cleaned}" was not found. Redirected to Overview.`,
          `La route « #/${cleaned} » est introuvable. Redirection vers l’Aperçu.`,
          { severity: 'warning', context: { rawHash } },
        ),
      );
  }
};

export const buildHashFromRoute = (route: AppRoute): string => {
  switch (route.name) {
    case 'overview':
      return '#/overview';
    case 'diagrams':
      return route.diagramMode
        ? `#/diagrams/${route.diagramMode}`
        : '#/diagrams/architecture';
    case 'guide':
      return route.stepId ? `#/guide/${route.stepId}` : '#/guide/qiyam_ready';
    case 'matrix':
      return '#/matrix';
  }
};

export const syncBrowserHash = (route: AppRoute): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const targetHash = buildHashFromRoute(route);
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
};
