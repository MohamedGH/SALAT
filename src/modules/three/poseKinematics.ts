import type { PostureId } from '../prayer/prayerData';
import type { CameraPreset } from '../state/store';

export interface Vec3Tuple {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface PosturePose {
  readonly pelvisPos: Vec3Tuple;
  readonly pelvisRot: Vec3Tuple;
  readonly spineRot: Vec3Tuple;
  readonly chestRot: Vec3Tuple;
  readonly headRot: Vec3Tuple;
  readonly leftShoulderRot: Vec3Tuple;
  readonly leftElbowRot: Vec3Tuple;
  readonly rightShoulderRot: Vec3Tuple;
  readonly rightElbowRot: Vec3Tuple;
  readonly leftHipRot: Vec3Tuple;
  readonly leftKneeRot: Vec3Tuple;
  readonly leftAnkleRot: Vec3Tuple;
  readonly rightHipRot: Vec3Tuple;
  readonly rightKneeRot: Vec3Tuple;
  readonly rightAnkleRot: Vec3Tuple;
  readonly indexPointFactor: number;
  readonly showSevenPointMarkers: boolean;
  readonly showRukuAngleGuide: boolean;
}

export interface CameraTargetSpec {
  readonly position: Vec3Tuple;
  readonly target: Vec3Tuple;
}

const zero = (): Vec3Tuple => ({ x: 0, y: 0, z: 0 });
const deg = (d: number): number => (d * Math.PI) / 180;

export const POSTURE_POSES: Readonly<Record<PostureId, PosturePose>> = {
  qiyam_ready: {
    pelvisPos: { x: 0, y: 0.94, z: 0 },
    pelvisRot: zero(),
    spineRot: zero(),
    chestRot: zero(),
    headRot: { x: deg(12), y: 0, z: 0 },
    leftShoulderRot: { x: deg(5), y: 0, z: deg(7) },
    leftElbowRot: { x: deg(-10), y: 0, z: 0 },
    rightShoulderRot: { x: deg(5), y: 0, z: deg(-7) },
    rightElbowRot: { x: deg(-10), y: 0, z: 0 },
    leftHipRot: zero(),
    leftKneeRot: zero(),
    leftAnkleRot: zero(),
    rightHipRot: zero(),
    rightKneeRot: zero(),
    rightAnkleRot: zero(),
    indexPointFactor: 0,
    showSevenPointMarkers: false,
    showRukuAngleGuide: false,
  },
  takbir_ihram: {
    pelvisPos: { x: 0, y: 0.94, z: 0 },
    pelvisRot: zero(),
    spineRot: zero(),
    chestRot: zero(),
    headRot: { x: deg(10), y: 0, z: 0 },
    leftShoulderRot: { x: deg(-65), y: deg(10), z: deg(32) },
    leftElbowRot: { x: deg(-88), y: 0, z: deg(-16) },
    rightShoulderRot: { x: deg(-65), y: deg(-10), z: deg(-32) },
    rightElbowRot: { x: deg(-88), y: 0, z: deg(16) },
    leftHipRot: zero(),
    leftKneeRot: zero(),
    leftAnkleRot: zero(),
    rightHipRot: zero(),
    rightKneeRot: zero(),
    rightAnkleRot: zero(),
    indexPointFactor: 0,
    showSevenPointMarkers: false,
    showRukuAngleGuide: false,
  },
  qiyam_qiraah: {
    pelvisPos: { x: 0, y: 0.94, z: 0 },
    pelvisRot: zero(),
    spineRot: zero(),
    chestRot: zero(),
    headRot: { x: deg(14), y: 0, z: 0 },
    leftShoulderRot: { x: deg(-26), y: deg(20), z: deg(14) },
    leftElbowRot: { x: deg(-86), y: deg(-45), z: 0 },
    rightShoulderRot: { x: deg(-32), y: deg(-24), z: deg(-14) },
    rightElbowRot: { x: deg(-90), y: deg(48), z: 0 },
    leftHipRot: zero(),
    leftKneeRot: zero(),
    leftAnkleRot: zero(),
    rightHipRot: zero(),
    rightKneeRot: zero(),
    rightAnkleRot: zero(),
    indexPointFactor: 0,
    showSevenPointMarkers: false,
    showRukuAngleGuide: false,
  },
  ruku: {
    pelvisPos: { x: 0, y: 0.9, z: -0.05 },
    pelvisRot: { x: deg(42), y: 0, z: 0 },
    spineRot: { x: deg(24), y: 0, z: 0 },
    chestRot: { x: deg(24), y: 0, z: 0 },
    headRot: { x: deg(-14), y: 0, z: 0 },
    leftShoulderRot: { x: deg(-82), y: 0, z: deg(6) },
    leftElbowRot: { x: deg(-8), y: 0, z: 0 },
    rightShoulderRot: { x: deg(-82), y: 0, z: deg(-6) },
    rightElbowRot: { x: deg(-8), y: 0, z: 0 },
    leftHipRot: { x: deg(-44), y: 0, z: 0 },
    leftKneeRot: { x: deg(4), y: 0, z: 0 },
    leftAnkleRot: zero(),
    rightHipRot: { x: deg(-44), y: 0, z: 0 },
    rightKneeRot: { x: deg(4), y: 0, z: 0 },
    rightAnkleRot: zero(),
    indexPointFactor: 0,
    showSevenPointMarkers: false,
    showRukuAngleGuide: true,
  },
  itidal: {
    pelvisPos: { x: 0, y: 0.94, z: 0 },
    pelvisRot: zero(),
    spineRot: zero(),
    chestRot: zero(),
    headRot: { x: deg(10), y: 0, z: 0 },
    leftShoulderRot: { x: deg(4), y: 0, z: deg(8) },
    leftElbowRot: { x: deg(-8), y: 0, z: 0 },
    rightShoulderRot: { x: deg(4), y: 0, z: deg(-8) },
    rightElbowRot: { x: deg(-8), y: 0, z: 0 },
    leftHipRot: zero(),
    leftKneeRot: zero(),
    leftAnkleRot: zero(),
    rightHipRot: zero(),
    rightKneeRot: zero(),
    rightAnkleRot: zero(),
    indexPointFactor: 0,
    showSevenPointMarkers: false,
    showRukuAngleGuide: false,
  },
  sujud_1: {
    pelvisPos: { x: 0, y: 0.44, z: -0.22 },
    pelvisRot: { x: deg(66), y: 0, z: 0 },
    spineRot: { x: deg(32), y: 0, z: 0 },
    chestRot: { x: deg(28), y: 0, z: 0 },
    headRot: { x: deg(-26), y: 0, z: 0 },
    leftShoulderRot: { x: deg(-116), y: deg(10), z: deg(18) },
    leftElbowRot: { x: deg(-64), y: 0, z: 0 },
    rightShoulderRot: { x: deg(-116), y: deg(-10), z: deg(-18) },
    rightElbowRot: { x: deg(-64), y: 0, z: 0 },
    leftHipRot: { x: deg(-102), y: 0, z: 0 },
    leftKneeRot: { x: deg(118), y: 0, z: 0 },
    leftAnkleRot: { x: deg(-40), y: 0, z: 0 },
    rightHipRot: { x: deg(-102), y: 0, z: 0 },
    rightKneeRot: { x: deg(118), y: 0, z: 0 },
    rightAnkleRot: { x: deg(-40), y: 0, z: 0 },
    indexPointFactor: 0,
    showSevenPointMarkers: true,
    showRukuAngleGuide: false,
  },
  jalsa: {
    pelvisPos: { x: 0, y: 0.34, z: -0.14 },
    pelvisRot: { x: deg(4), y: 0, z: 0 },
    spineRot: zero(),
    chestRot: zero(),
    headRot: { x: deg(14), y: 0, z: 0 },
    leftShoulderRot: { x: deg(-32), y: deg(6), z: deg(10) },
    leftElbowRot: { x: deg(-36), y: 0, z: 0 },
    rightShoulderRot: { x: deg(-32), y: deg(-6), z: deg(-10) },
    rightElbowRot: { x: deg(-36), y: 0, z: 0 },
    leftHipRot: { x: deg(-86), y: deg(6), z: 0 },
    leftKneeRot: { x: deg(142), y: 0, z: 0 },
    leftAnkleRot: { x: deg(35), y: 0, z: 0 },
    rightHipRot: { x: deg(-86), y: deg(-6), z: 0 },
    rightKneeRot: { x: deg(142), y: 0, z: 0 },
    rightAnkleRot: { x: deg(-32), y: 0, z: 0 },
    indexPointFactor: 0,
    showSevenPointMarkers: false,
    showRukuAngleGuide: false,
  },
  sujud_2: {
    pelvisPos: { x: 0, y: 0.44, z: -0.22 },
    pelvisRot: { x: deg(66), y: 0, z: 0 },
    spineRot: { x: deg(32), y: 0, z: 0 },
    chestRot: { x: deg(28), y: 0, z: 0 },
    headRot: { x: deg(-26), y: 0, z: 0 },
    leftShoulderRot: { x: deg(-116), y: deg(10), z: deg(18) },
    leftElbowRot: { x: deg(-64), y: 0, z: 0 },
    rightShoulderRot: { x: deg(-116), y: deg(-10), z: deg(-18) },
    rightElbowRot: { x: deg(-64), y: 0, z: 0 },
    leftHipRot: { x: deg(-102), y: 0, z: 0 },
    leftKneeRot: { x: deg(118), y: 0, z: 0 },
    leftAnkleRot: { x: deg(-40), y: 0, z: 0 },
    rightHipRot: { x: deg(-102), y: 0, z: 0 },
    rightKneeRot: { x: deg(118), y: 0, z: 0 },
    rightAnkleRot: { x: deg(-40), y: 0, z: 0 },
    indexPointFactor: 0,
    showSevenPointMarkers: true,
    showRukuAngleGuide: false,
  },
  tashahhud: {
    pelvisPos: { x: 0, y: 0.34, z: -0.14 },
    pelvisRot: { x: deg(4), y: 0, z: 0 },
    spineRot: zero(),
    chestRot: zero(),
    headRot: { x: deg(18), y: deg(-8), z: 0 },
    leftShoulderRot: { x: deg(-32), y: deg(6), z: deg(10) },
    leftElbowRot: { x: deg(-36), y: 0, z: 0 },
    rightShoulderRot: { x: deg(-36), y: deg(-6), z: deg(-10) },
    rightElbowRot: { x: deg(-42), y: 0, z: 0 },
    leftHipRot: { x: deg(-86), y: deg(6), z: 0 },
    leftKneeRot: { x: deg(142), y: 0, z: 0 },
    leftAnkleRot: { x: deg(35), y: 0, z: 0 },
    rightHipRot: { x: deg(-86), y: deg(-6), z: 0 },
    rightKneeRot: { x: deg(142), y: 0, z: 0 },
    rightAnkleRot: { x: deg(-32), y: 0, z: 0 },
    indexPointFactor: 1,
    showSevenPointMarkers: false,
    showRukuAngleGuide: false,
  },
  taslim: {
    pelvisPos: { x: 0, y: 0.34, z: -0.14 },
    pelvisRot: { x: deg(4), y: 0, z: 0 },
    spineRot: zero(),
    chestRot: zero(),
    headRot: { x: deg(6), y: deg(-58), z: 0 },
    leftShoulderRot: { x: deg(-32), y: deg(6), z: deg(10) },
    leftElbowRot: { x: deg(-36), y: 0, z: 0 },
    rightShoulderRot: { x: deg(-32), y: deg(-6), z: deg(-10) },
    rightElbowRot: { x: deg(-36), y: 0, z: 0 },
    leftHipRot: { x: deg(-86), y: deg(6), z: 0 },
    leftKneeRot: { x: deg(142), y: 0, z: 0 },
    leftAnkleRot: { x: deg(35), y: 0, z: 0 },
    rightHipRot: { x: deg(-86), y: deg(-6), z: 0 },
    rightKneeRot: { x: deg(142), y: 0, z: 0 },
    rightAnkleRot: { x: deg(-32), y: 0, z: 0 },
    indexPointFactor: 0,
    showSevenPointMarkers: false,
    showRukuAngleGuide: false,
  },
};

export const getPoseForStep = (stepId: PostureId): PosturePose =>
  POSTURE_POSES[stepId];

export const dampValue = (
  current: number,
  target: number,
  lambda: number,
  delta: number,
): number => {
  if (delta <= 0) return current;
  const factor = 1 - Math.exp(-lambda * delta);
  return current + (target - current) * factor;
};

export const dampVec3 = (
  current: Vec3Tuple,
  target: Vec3Tuple,
  lambda: number,
  delta: number,
): Vec3Tuple => ({
  x: dampValue(current.x, target.x, lambda, delta),
  y: dampValue(current.y, target.y, lambda, delta),
  z: dampValue(current.z, target.z, lambda, delta),
});

export const maxVec3Diff = (a: Vec3Tuple, b: Vec3Tuple): number =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));

export const isPoseSettled = (
  current: PosturePose,
  target: PosturePose,
  epsilon = 0.002,
): boolean =>
  maxVec3Diff(current.pelvisPos, target.pelvisPos) < epsilon &&
  maxVec3Diff(current.pelvisRot, target.pelvisRot) < epsilon &&
  maxVec3Diff(current.spineRot, target.spineRot) < epsilon &&
  maxVec3Diff(current.chestRot, target.chestRot) < epsilon &&
  maxVec3Diff(current.headRot, target.headRot) < epsilon &&
  maxVec3Diff(current.leftShoulderRot, target.leftShoulderRot) < epsilon &&
  maxVec3Diff(current.rightShoulderRot, target.rightShoulderRot) < epsilon &&
  maxVec3Diff(current.leftHipRot, target.leftHipRot) < epsilon &&
  maxVec3Diff(current.leftKneeRot, target.leftKneeRot) < epsilon &&
  Math.abs(current.indexPointFactor - target.indexPointFactor) < epsilon;

export const getCameraPresetSpec = (
  preset: CameraPreset,
  stepId: PostureId,
): CameraTargetSpec => {
  const isLowPosture =
    stepId === 'sujud_1' ||
    stepId === 'sujud_2' ||
    stepId === 'jalsa' ||
    stepId === 'tashahhud' ||
    stepId === 'taslim';
  const focusY = isLowPosture ? 0.45 : 0.92;

  switch (preset) {
    case 'threeQuarter':
      return {
        position: { x: 2.15, y: isLowPosture ? 1.25 : 1.55, z: 2.2 },
        target: { x: 0, y: focusY, z: 0.05 },
      };
    case 'profile':
      return {
        position: { x: 2.65, y: isLowPosture ? 0.72 : 1.05, z: 0.05 },
        target: { x: 0, y: focusY, z: 0.05 },
      };
    case 'top':
      return {
        position: { x: 0.01, y: 3.3, z: 0.5 },
        target: { x: 0, y: 0.2, z: 0 },
      };
    case 'closeUp':
      return {
        position: { x: 1.15, y: isLowPosture ? 0.78 : 1.32, z: 1.25 },
        target: { x: 0, y: isLowPosture ? 0.42 : 1.08, z: 0.05 },
      };
  }
};
