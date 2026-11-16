import { describe, expect, it } from 'vitest';
import {
  calculateReadiness,
  evaluateOmissionOutcome,
  filterRules,
  generatePrayerSequence,
  getRuleCounts,
} from '../modules/prayer/fiqhEngine';
import {
  ALL_FIQH_RULES,
  SHURUT_CONDITIONS,
} from '../modules/prayer/prayerData';

describe('fiqhEngine & prayerData', () => {
  it('contains exact canonical counts of Conditions, Pillars, Obligations, and Postures', () => {
    expect(getRuleCounts()).toEqual({
      conditions: 9,
      pillars: 14,
      obligations: 8,
      steps: 10,
    });
  });

  it('filters rules accurately across English, French, transliteration, and Arabic', () => {
    const fatihahEn = filterRules(ALL_FIQH_RULES, 'pillar', 'Fatihah', 'en');
    expect(fatihahEn.map((r) => r.id)).toContain('rukn-3');

    const inclinationFr = filterRules(
      ALL_FIQH_RULES,
      'pillar',
      'Inclinaison',
      'fr',
    );
    expect(inclinationFr.map((r) => r.id)).toContain('rukn-4');

    const arabicMatch = filterRules(ALL_FIQH_RULES, 'condition', 'النية', 'en');
    expect(arabicMatch.map((r) => r.id)).toEqual(['shart-9']);
  });

  it('evaluates deliberate vs forgetful omission outcomes accurately', () => {
    const condForgetful = evaluateOmissionOutcome('condition', 'forgetful');
    expect(condForgetful.prayerValid).toBe(false);
    expect(condForgetful.requiresRepeatPrayer).toBe(true);

    const pillarDeliberate = evaluateOmissionOutcome('pillar', 'deliberate');
    expect(pillarDeliberate.prayerValid).toBe(false);

    const pillarForgetful = evaluateOmissionOutcome('pillar', 'forgetful');
    expect(pillarForgetful.prayerValid).toBe(true);
    expect(pillarForgetful.requiresRepeatAct).toBe(true);
    expect(pillarForgetful.requiresSujudSahw).toBe(true);

    const wajibForgetful = evaluateOmissionOutcome('obligation', 'forgetful');
    expect(wajibForgetful.prayerValid).toBe(true);
    expect(wajibForgetful.requiresRepeatAct).toBe(false);
    expect(wajibForgetful.requiresSujudSahw).toBe(true);

    const sunnahDeliberate = evaluateOmissionOutcome('sunnah', 'deliberate');
    expect(sunnahDeliberate.prayerValid).toBe(true);
    expect(sunnahDeliberate.requiresSujudSahw).toBe(false);
  });

  it('generates complete Rak’ah sequences with middle Tashahhud for 3 and 4 Rak’ahs', () => {
    const fajr = generatePrayerSequence('fajr');
    // 2 Rak'ahs: 2 opening + 6*2 core + 2 ending = 16
    expect(fajr).toHaveLength(16);
    expect(fajr.filter((n) => n.sittingKind === 'first_tashahhud')).toHaveLength(0);
    expect(fajr.filter((n) => n.sittingKind === 'final_tashahhud')).toHaveLength(1);

    const maghrib = generatePrayerSequence('maghrib');
    expect(maghrib.filter((n) => n.sittingKind === 'first_tashahhud')).toHaveLength(1);
    expect(maghrib.filter((n) => n.sittingKind === 'final_tashahhud')).toHaveLength(1);
    expect(maghrib[maghrib.length - 1].step.id).toBe('taslim');

    const dhuhr = generatePrayerSequence('dhuhr');
    expect(dhuhr[0].step.id).toBe('qiyam_ready');
    expect(dhuhr[dhuhr.length - 1].rakahNumber).toBe(4);
  });

  it('calculates pre-prayer condition readiness percentage and missing items', () => {
    const partial = calculateReadiness(['shart-1', 'shart-2', 'shart-3']);
    expect(partial.completedCount).toBe(3);
    expect(partial.totalCount).toBe(9);
    expect(partial.percentage).toBe(33);
    expect(partial.isReady).toBe(false);
    expect(partial.missingItems).toHaveLength(6);

    const full = calculateReadiness(SHURUT_CONDITIONS.map((c) => c.id));
    expect(full.percentage).toBe(100);
    expect(full.isReady).toBe(true);
    expect(full.missingItems).toHaveLength(0);
  });
});
