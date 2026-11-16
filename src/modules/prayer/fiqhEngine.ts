import {
  ALL_FIQH_RULES,
  DAILY_PRAYERS,
  PRAYER_STEPS,
  SHURUT_CONDITIONS,
  type DailyPrayerDefinition,
  type FiqhCategory,
  type FiqhRuleItem,
  type PostureId,
  type PrayerStep,
} from './prayerData';
import type { Language, LocalizedText } from '../i18n/translations';

export type OmissionTiming = 'deliberate' | 'forgetful';

export interface OmissionOutcome {
  readonly category: FiqhCategory;
  readonly timing: OmissionTiming;
  readonly prayerValid: boolean;
  readonly requiresRepeatPrayer: boolean;
  readonly requiresRepeatAct: boolean;
  readonly requiresSujudSahw: boolean;
  readonly badgeLabel: LocalizedText;
  readonly rulingSummary: LocalizedText;
}

export interface SequenceNode {
  readonly sequenceIndex: number;
  readonly rakahNumber: number;
  readonly totalRakahs: number;
  readonly step: PrayerStep;
  readonly sittingKind?: 'first_tashahhud' | 'final_tashahhud';
}

export interface ReadinessSummary {
  readonly completedCount: number;
  readonly totalCount: number;
  readonly percentage: number;
  readonly isReady: boolean;
  readonly missingItems: readonly FiqhRuleItem[];
}

export const getPrayerById = (
  id: DailyPrayerDefinition['id'],
): DailyPrayerDefinition =>
  DAILY_PRAYERS.find((p) => p.id === id) ?? DAILY_PRAYERS[1];

export const getStepById = (id: PostureId): PrayerStep =>
  PRAYER_STEPS.find((s) => s.id === id) ?? PRAYER_STEPS[0];

export const filterRules = (
  items: readonly FiqhRuleItem[],
  category: FiqhCategory | 'all',
  query: string,
  lang: Language,
): readonly FiqhRuleItem[] => {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const title = (lang === 'fr' ? item.title.fr : item.title.en).toLowerCase();
    const summary = (
      lang === 'fr' ? item.summary.fr : item.summary.en
    ).toLowerCase();
    return (
      title.includes(normalizedQuery) ||
      summary.includes(normalizedQuery) ||
      item.transliteration.toLowerCase().includes(normalizedQuery) ||
      item.arabic.includes(query.trim())
    );
  });
};

export const evaluateOmissionOutcome = (
  category: FiqhCategory,
  timing: OmissionTiming,
): OmissionOutcome => {
  if (category === 'condition') {
    return {
      category,
      timing,
      prayerValid: false,
      requiresRepeatPrayer: true,
      requiresRepeatAct: false,
      requiresSujudSahw: false,
      badgeLabel: {
        en: 'Invalid — Prerequisite Missing',
        fr: 'Invalide — Condition Manquante',
      },
      rulingSummary: {
        en: 'Because Conditions (Shurut) are prerequisites before entering Salah, missing a condition (such as Wudu or Qiblah) means the prayer is not valid and must be repeated once fulfilled (with narrow exceptions for forgotten physical impurity discovered afterward).',
        fr: 'Les Conditions (Shurut) étant des prérequis à la prière, leur absence invalide l’entrée en prière : il faut remplir la condition (ex. Wudu) puis recommencer (sauf exception pour une impureté découverte après la prière).',
      },
    };
  }

  if (category === 'pillar') {
    if (timing === 'deliberate') {
      return {
        category,
        timing,
        prayerValid: false,
        requiresRepeatPrayer: true,
        requiresRepeatAct: false,
        requiresSujudSahw: false,
        badgeLabel: {
          en: 'Invalid — Repeat Prayer',
          fr: 'Invalide — Prière à Refaire',
        },
        rulingSummary: {
          en: 'Intentionally omitting any Pillar (Rukn) invalidates the entire prayer immediately; Sujud al-Sahw cannot compensate for a Pillar.',
          fr: 'Omettre volontairement un Pilier (Rukn) invalide immédiatement toute la prière ; le Sujud al-Sahw ne peut pas le remplacer.',
        },
      };
    }
    return {
      category,
      timing,
      prayerValid: true,
      requiresRepeatPrayer: false,
      requiresRepeatAct: true,
      requiresSujudSahw: true,
      badgeLabel: {
        en: 'Must Perform Pillar + Sujud Sahw',
        fr: 'Rattraper le Pilier + Sujud Sahw',
      },
      rulingSummary: {
        en: 'If forgotten, Sujud al-Sahw alone is insufficient: you must return to perform the missed Pillar (or repeat that Rak’ah if you already reached the same point in the next Rak’ah) AND conclude with Sujud al-Sahw.',
        fr: 'En cas d’oubli, le Sujud al-Sahw seul ne suffit pas : il faut revenir accomplir le Pilier manqué (ou refaire la Rak’ah si le même point suivant est atteint) PUIS faire le Sujud al-Sahw.',
      },
    };
  }

  if (category === 'obligation') {
    if (timing === 'deliberate') {
      return {
        category,
        timing,
        prayerValid: false,
        requiresRepeatPrayer: true,
        requiresRepeatAct: false,
        requiresSujudSahw: false,
        badgeLabel: {
          en: 'Invalid — Deliberate Omission',
          fr: 'Invalide — Omission Volontaire',
        },
        rulingSummary: {
          en: 'Intentionally skipping an Obligation (Wajib) — such as the First Tashahhud or Tasbih in Ruku — invalidates the prayer.',
          fr: 'Délaisser volontairement une Obligation (Wajib) — comme le premier Tashahhud — invalide la prière.',
        },
      };
    }
    return {
      category,
      timing,
      prayerValid: true,
      requiresRepeatPrayer: false,
      requiresRepeatAct: false,
      requiresSujudSahw: true,
      badgeLabel: {
        en: 'Valid via Sujud al-Sahw',
        fr: 'Valide avec Sujud al-Sahw',
      },
      rulingSummary: {
        en: 'When an Obligation (Wajib) is missed forgetfully, you do not return to it once past it — instead, complete the prayer and perform Sujud al-Sahw (two prostrations of forgetfulness) to repair it.',
        fr: 'Lorsqu’une Obligation (Wajib) est oubliée, on ne revient pas en arrière si l’on est déjà dans le pilier suivant : la prière reste valide en accomplissant le Sujud al-Sahw.',
      },
    };
  }

  return {
    category,
    timing,
    prayerValid: true,
    requiresRepeatPrayer: false,
    requiresRepeatAct: false,
    requiresSujudSahw: false,
    badgeLabel: {
      en: 'Valid — No Sujud Sahw Needed',
      fr: 'Valide — Sans Sujud Sahw',
    },
    rulingSummary: {
      en: 'Missing a Recommended act (Sunnah) does not invalidate the prayer and does not require Sujud al-Sahw, though performing Sunnah acts increases reward and completeness.',
      fr: 'Omettre un acte recommandé (Sunnah) n’invalide pas la prière et ne nécessite pas le Sujud al-Sahw.',
    },
  };
};

export const generatePrayerSequence = (
  prayerId: DailyPrayerDefinition['id'],
): readonly SequenceNode[] => {
  const prayer = getPrayerById(prayerId);
  const totalRakahs = prayer.rakahs;
  const nodes: SequenceNode[] = [];
  let seqIndex = 0;

  for (let r = 1; r <= totalRakahs; r++) {
    if (r === 1) {
      nodes.push({
        sequenceIndex: seqIndex++,
        rakahNumber: r,
        totalRakahs,
        step: getStepById('qiyam_ready'),
      });
      nodes.push({
        sequenceIndex: seqIndex++,
        rakahNumber: r,
        totalRakahs,
        step: getStepById('takbir_ihram'),
      });
    }

    const coreIds: readonly PostureId[] = [
      'qiyam_qiraah',
      'ruku',
      'itidal',
      'sujud_1',
      'jalsa',
      'sujud_2',
    ];

    for (const id of coreIds) {
      nodes.push({
        sequenceIndex: seqIndex++,
        rakahNumber: r,
        totalRakahs,
        step: getStepById(id),
      });
    }

    if (r === 2 && totalRakahs > 2) {
      nodes.push({
        sequenceIndex: seqIndex++,
        rakahNumber: r,
        totalRakahs,
        step: getStepById('tashahhud'),
        sittingKind: 'first_tashahhud',
      });
    }

    if (r === totalRakahs) {
      nodes.push({
        sequenceIndex: seqIndex++,
        rakahNumber: r,
        totalRakahs,
        step: getStepById('tashahhud'),
        sittingKind: 'final_tashahhud',
      });
      nodes.push({
        sequenceIndex: seqIndex++,
        rakahNumber: r,
        totalRakahs,
        step: getStepById('taslim'),
      });
    }
  }

  return nodes;
};

export const calculateReadiness = (
  checkedIds: readonly string[],
): ReadinessSummary => {
  const validSet = new Set(checkedIds);
  const missingItems = SHURUT_CONDITIONS.filter((c) => !validSet.has(c.id));
  const totalCount = SHURUT_CONDITIONS.length;
  const completedCount = totalCount - missingItems.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  return {
    completedCount,
    totalCount,
    percentage,
    isReady: missingItems.length === 0,
    missingItems,
  };
};

export const getRuleCounts = () => ({
  conditions: ALL_FIQH_RULES.filter((r) => r.category === 'condition').length,
  pillars: ALL_FIQH_RULES.filter((r) => r.category === 'pillar').length,
  obligations: ALL_FIQH_RULES.filter((r) => r.category === 'obligation').length,
  steps: PRAYER_STEPS.length,
});
