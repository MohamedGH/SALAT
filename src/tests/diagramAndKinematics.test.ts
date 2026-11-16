import { describe, expect, it } from 'vitest';
import {
  buildCurvedEdgePath,
  computeCycleDiagramNodes,
  computeRingNodePositions,
  getCategoryColorToken,
} from '../modules/diagrams/diagramLayout';
import { PRAYER_STEPS } from '../modules/prayer/prayerData';
import {
  dampValue,
  dampVec3,
  getCameraPresetSpec,
  getPoseForStep,
  isPoseSettled,
  POSTURE_POSES,
} from '../modules/three/poseKinematics';

describe('diagramLayout & poseKinematics', () => {
  it('computes symmetric radial ring coordinates and curved SVG edge paths', () => {
    const pts = computeRingNodePositions(200, 200, 100, 4);
    expect(pts).toHaveLength(4);
    expect(pts[0]).toEqual({ x: 200, y: 100 });
    expect(pts[1]).toEqual({ x: 300, y: 200 });

    const cycleNodes = computeCycleDiagramNodes(240, 230, 175, 165);
    expect(cycleNodes).toHaveLength(10);
    expect(cycleNodes[0].id).toBe('qiyam_ready');
    expect(cycleNodes[9].id).toBe('taslim');

    const path = buildCurvedEdgePath(
      cycleNodes[0],
      cycleNodes[1],
      { x: 240, y: 230 },
    );
    expect(path.startsWith('M ')).toBe(true);
    expect(path.includes(' Q ')).toBe(true);

    expect(getCategoryColorToken('condition').glyph).toBe('◆');
    expect(getCategoryColorToken('pillar').glyph).toBe('●');
    expect(getCategoryColorToken('obligation').glyph).toBe('▲');
  });

  it('defines valid 3D poses for all 10 prayer steps and smoothly damps toward targets', () => {
    for (const step of PRAYER_STEPS) {
      const pose = POSTURE_POSES[step.id];
      expect(pose).toBeDefined();
      expect(typeof pose.pelvisPos.y).toBe('number');
    }

    const sujudPose = getPoseForStep('sujud_1');
    expect(sujudPose.showSevenPointMarkers).toBe(true);

    const rukuPose = getPoseForStep('ruku');
    expect(rukuPose.showRukuAngleGuide).toBe(true);

    expect(dampValue(0, 10, 8, 0.016)).toBeGreaterThan(0);
    expect(dampValue(0, 10, 8, 0)).toBe(0);

    const dampedVec = dampVec3(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 2, z: 3 },
      10,
      0.05,
    );
    expect(dampedVec.y).toBeGreaterThan(0);
    expect(dampedVec.y).toBeLessThan(2);

    expect(isPoseSettled(sujudPose, sujudPose)).toBe(true);
    expect(isPoseSettled(sujudPose, rukuPose)).toBe(false);
  });

  it('adjusts camera target height appropriately for standing vs low postures', () => {
    const standingCam = getCameraPresetSpec('profile', 'qiyam_ready');
    const sujudCam = getCameraPresetSpec('profile', 'sujud_1');
    expect(sujudCam.target.y).toBeLessThan(standingCam.target.y);
    expect(sujudCam.position.y).toBeLessThan(standingCam.position.y);
  });
});
