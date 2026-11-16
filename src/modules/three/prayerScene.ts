import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createAppError,
  err,
  ok,
  type AppError,
  type Result,
} from '../errors/errorManager';
import type { PostureId } from '../prayer/prayerData';
import type { CameraPreset } from '../state/store';
import {
  dampValue,
  dampVec3,
  getCameraPresetSpec,
  getPoseForStep,
  isPoseSettled,
  type PosturePose,
} from './poseKinematics';

export interface PrayerSceneOptions {
  readonly container: HTMLElement;
  readonly initialStepId: PostureId;
  readonly initialCameraPreset: CameraPreset;
  readonly showAlignmentGuides: boolean;
  readonly onContextLost?: (error: AppError) => void;
}

export interface PrayerSceneController {
  readonly setStep: (stepId: PostureId) => void;
  readonly setCameraPreset: (preset: CameraPreset) => void;
  readonly setAlignmentGuides: (visible: boolean) => void;
  readonly resize: () => void;
  readonly dispose: () => void;
}

const _camPosTarget = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3();

export const detectSoftwareWebGL = (): {
  readonly supported: boolean;
  readonly isSoftwareGl: boolean;
} => {
  if (typeof document === 'undefined') {
    return { supported: false, isSoftwareGl: true };
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) {
      return { supported: false, isSoftwareGl: true };
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl =
      /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: true };
  }
};

const createPrayerMatTexture = (
  maxAnisotropy: number,
): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Rich mosque emerald field
    ctx.fillStyle = '#0F5C4D';
    ctx.fillRect(0, 0, 512, 1024);

    // Subtle woven textile grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    for (let y = 0; y < 1024; y += 4) {
      ctx.fillRect(0, y, 512, 1);
    }

    // Outer gold border
    ctx.strokeStyle = '#C69D4B';
    ctx.lineWidth = 14;
    ctx.strokeRect(24, 24, 464, 976);

    // Inner ivory geometric frame
    ctx.strokeStyle = '#EFE9DC';
    ctx.lineWidth = 4;
    ctx.strokeRect(46, 46, 420, 932);

    // Corner medallions
    const corners: [number, number][] = [
      [66, 66],
      [446, 66],
      [66, 958],
      [446, 958],
    ];
    ctx.fillStyle = '#C69D4B';
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pointed Mihrab arch pointing toward -Z (top of texture)
    ctx.strokeStyle = '#D9B66C';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(86, 860);
    ctx.lineTo(86, 330);
    ctx.quadraticCurveTo(86, 170, 256, 105);
    ctx.quadraticCurveTo(426, 170, 426, 330);
    ctx.lineTo(426, 860);
    ctx.closePath();
    ctx.stroke();

    // Inner deep emerald arch fill
    ctx.fillStyle = '#0B493D';
    ctx.fill();
    ctx.stroke();

    // Subtle Qiblah star medallion at prostration spot
    ctx.save();
    ctx.translate(256, 260);
    ctx.strokeStyle = '#C69D4B';
    ctx.lineWidth = 3;
    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 4);
      ctx.strokeRect(-32, -32, 64, 64);
      ctx.restore();
    }
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
};

const createLimestoneFloorTexture = (
  maxAnisotropy: number,
): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#EAE5DC';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#DDD6CA';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 512; i += 128) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
};

const createContactShadowTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 122);
    grad.addColorStop(0, 'rgba(20, 22, 24, 0.35)');
    grad.addColorStop(0.6, 'rgba(20, 22, 24, 0.12)');
    grad.addColorStop(1, 'rgba(20, 22, 24, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

interface ArticulatedRig {
  readonly root: THREE.Group;
  readonly pelvis: THREE.Group;
  readonly spine: THREE.Group;
  readonly chest: THREE.Group;
  readonly head: THREE.Group;
  readonly leftShoulder: THREE.Group;
  readonly leftElbow: THREE.Group;
  readonly rightShoulder: THREE.Group;
  readonly rightElbow: THREE.Group;
  readonly rightIndexFinger: THREE.Mesh;
  readonly leftHip: THREE.Group;
  readonly leftKnee: THREE.Group;
  readonly leftAnkle: THREE.Group;
  readonly rightHip: THREE.Group;
  readonly rightKnee: THREE.Group;
  readonly rightAnkle: THREE.Group;
}

const buildArticulatedFigure = (
  shadowEnabled: boolean,
): { readonly rig: ArticulatedRig; readonly disposables: Array<{ dispose: () => void }> } => {
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // Distinct calibrated PBR materials with >= 0.25 roughness differentiation
  const robeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xf4f1ea,
      roughness: 0.88,
      metalness: 0.02,
    }),
  );
  const trimMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x0f5c4d,
      roughness: 0.52,
      metalness: 0.12,
    }),
  );
  const skinMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xd2a886,
      roughness: 0.62,
      metalness: 0.0,
    }),
  );
  const kufiMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xb5893a,
      roughness: 0.36,
      metalness: 0.38,
    }),
  );

  const root = new THREE.Group();
  const pelvis = new THREE.Group();
  root.add(pelvis);

  const enableShadows = (mesh: THREE.Mesh) => {
    mesh.castShadow = shadowEnabled;
    mesh.receiveShadow = shadowEnabled;
    return mesh;
  };

  // Pelvis / hip tunic block
  const pelvisGeo = track(new THREE.CylinderGeometry(0.145, 0.155, 0.18, 20));
  const pelvisMesh = enableShadows(new THREE.Mesh(pelvisGeo, robeMat));
  pelvis.add(pelvisMesh);

  // Spine & Chest
  const spine = new THREE.Group();
  spine.position.set(0, 0.09, 0);
  pelvis.add(spine);

  const abdomenGeo = track(new THREE.CylinderGeometry(0.14, 0.145, 0.22, 20));
  const abdomenMesh = enableShadows(new THREE.Mesh(abdomenGeo, robeMat));
  abdomenMesh.position.set(0, 0.11, 0);
  spine.add(abdomenMesh);

  const chest = new THREE.Group();
  chest.position.set(0, 0.22, 0);
  spine.add(chest);

  const torsoGeo = track(new THREE.CylinderGeometry(0.165, 0.14, 0.26, 20));
  const torsoMesh = enableShadows(new THREE.Mesh(torsoGeo, robeMat));
  torsoMesh.position.set(0, 0.13, 0);
  chest.add(torsoMesh);

  // Emerald collar trim
  const collarGeo = track(new THREE.TorusGeometry(0.085, 0.016, 12, 24));
  const collarMesh = enableShadows(new THREE.Mesh(collarGeo, trimMat));
  collarMesh.rotation.x = Math.PI / 2;
  collarMesh.position.set(0, 0.26, 0);
  chest.add(collarMesh);

  // Neck & Head + Kufi
  const head = new THREE.Group();
  head.position.set(0, 0.28, 0);
  chest.add(head);

  const neckGeo = track(new THREE.CylinderGeometry(0.048, 0.056, 0.08, 16));
  const neckMesh = enableShadows(new THREE.Mesh(neckGeo, skinMat));
  neckMesh.position.set(0, 0.04, 0);
  head.add(neckMesh);

  const craniumGeo = track(new THREE.SphereGeometry(0.102, 24, 20));
  const craniumMesh = enableShadows(new THREE.Mesh(craniumGeo, skinMat));
  craniumMesh.scale.set(0.92, 1.08, 0.98);
  craniumMesh.position.set(0, 0.15, 0);
  head.add(craniumMesh);

  // Subtle nose marker so Qiblah & Taslim head orientation is crystal clear
  const noseGeo = track(new THREE.ConeGeometry(0.016, 0.036, 10));
  const noseMesh = enableShadows(new THREE.Mesh(noseGeo, skinMat));
  noseMesh.rotation.x = -Math.PI / 2;
  noseMesh.position.set(0, 0.145, -0.104);
  head.add(noseMesh);

  // Kufi cap with gold trim
  const kufiGeo = track(
    new THREE.CylinderGeometry(0.095, 0.098, 0.075, 22),
  );
  const kufiMesh = enableShadows(new THREE.Mesh(kufiGeo, trimMat));
  kufiMesh.position.set(0, 0.22, 0.005);
  head.add(kufiMesh);

  const kufiBandGeo = track(new THREE.TorusGeometry(0.096, 0.008, 10, 24));
  const kufiBand = enableShadows(new THREE.Mesh(kufiBandGeo, kufiMat));
  kufiBand.rotation.x = Math.PI / 2;
  kufiBand.position.set(0, 0.188, 0.005);
  head.add(kufiBand);

  // Helper to build symmetrical arms
  const buildArm = (side: -1 | 1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.195, 0.23, 0);
    chest.add(shoulder);

    const shoulderCapGeo = track(new THREE.SphereGeometry(0.058, 16, 14));
    const shoulderCap = enableShadows(new THREE.Mesh(shoulderCapGeo, robeMat));
    shoulder.add(shoulderCap);

    const upperArmGeo = track(
      new THREE.CylinderGeometry(0.052, 0.044, 0.27, 16),
    );
    const upperArm = enableShadows(new THREE.Mesh(upperArmGeo, robeMat));
    upperArm.position.set(0, -0.135, 0);
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.27, 0);
    shoulder.add(elbow);

    const forearmGeo = track(
      new THREE.CylinderGeometry(0.042, 0.032, 0.24, 16),
    );
    const forearm = enableShadows(new THREE.Mesh(forearmGeo, robeMat));
    forearm.position.set(0, -0.12, 0);
    elbow.add(forearm);

    const cuffGeo = track(new THREE.CylinderGeometry(0.034, 0.034, 0.025, 16));
    const cuff = enableShadows(new THREE.Mesh(cuffGeo, trimMat));
    cuff.position.set(0, -0.235, 0);
    elbow.add(cuff);

    const palmGeo = track(new THREE.BoxGeometry(0.042, 0.085, 0.068));
    const palm = enableShadows(new THREE.Mesh(palmGeo, skinMat));
    palm.position.set(0, -0.285, -0.01);
    elbow.add(palm);

    const indexGeo = track(new THREE.CylinderGeometry(0.008, 0.009, 0.055, 8));
    const indexFinger = enableShadows(new THREE.Mesh(indexGeo, skinMat));
    indexFinger.position.set(0, -0.32, -0.035);
    elbow.add(indexFinger);

    return { shoulder, elbow, indexFinger };
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Helper to build symmetrical legs
  const buildLeg = (side: -1 | 1) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.088, -0.06, 0);
    pelvis.add(hip);

    const thighGeo = track(new THREE.CylinderGeometry(0.068, 0.055, 0.42, 16));
    const thigh = enableShadows(new THREE.Mesh(thighGeo, robeMat));
    thigh.position.set(0, -0.21, 0);
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.set(0, -0.42, 0);
    hip.add(knee);

    const kneeJointGeo = track(new THREE.SphereGeometry(0.052, 14, 12));
    const kneeJoint = enableShadows(new THREE.Mesh(kneeJointGeo, robeMat));
    knee.add(kneeJoint);

    const shinGeo = track(new THREE.CylinderGeometry(0.052, 0.04, 0.4, 16));
    const shin = enableShadows(new THREE.Mesh(shinGeo, robeMat));
    shin.position.set(0, -0.2, 0);
    knee.add(shin);

    const ankle = new THREE.Group();
    ankle.position.set(0, -0.4, 0);
    knee.add(ankle);

    const footGeo = track(new THREE.BoxGeometry(0.075, 0.045, 0.165));
    const foot = enableShadows(new THREE.Mesh(footGeo, skinMat));
    foot.position.set(0, -0.025, -0.045);
    ankle.add(foot);

    return { hip, knee, ankle };
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  return {
    rig: {
      root,
      pelvis,
      spine,
      chest,
      head,
      leftShoulder: leftArm.shoulder,
      leftElbow: leftArm.elbow,
      rightShoulder: rightArm.shoulder,
      rightElbow: rightArm.elbow,
      rightIndexFinger: rightArm.indexFinger,
      leftHip: leftLeg.hip,
      leftKnee: leftLeg.knee,
      leftAnkle: leftLeg.ankle,
      rightHip: rightLeg.hip,
      rightKnee: rightLeg.knee,
      rightAnkle: rightLeg.ankle,
    },
    disposables,
  };
};

const applyPoseToRig = (rig: ArticulatedRig, pose: PosturePose) => {
  rig.pelvis.position.set(pose.pelvisPos.x, pose.pelvisPos.y, pose.pelvisPos.z);
  rig.pelvis.rotation.set(pose.pelvisRot.x, pose.pelvisRot.y, pose.pelvisRot.z);
  rig.spine.rotation.set(pose.spineRot.x, pose.spineRot.y, pose.spineRot.z);
  rig.chest.rotation.set(pose.chestRot.x, pose.chestRot.y, pose.chestRot.z);
  rig.head.rotation.set(pose.headRot.x, pose.headRot.y, pose.headRot.z);

  rig.leftShoulder.rotation.set(
    pose.leftShoulderRot.x,
    pose.leftShoulderRot.y,
    pose.leftShoulderRot.z,
  );
  rig.leftElbow.rotation.set(
    pose.leftElbowRot.x,
    pose.leftElbowRot.y,
    pose.leftElbowRot.z,
  );
  rig.rightShoulder.rotation.set(
    pose.rightShoulderRot.x,
    pose.rightShoulderRot.y,
    pose.rightShoulderRot.z,
  );
  rig.rightElbow.rotation.set(
    pose.rightElbowRot.x,
    pose.rightElbowRot.y,
    pose.rightElbowRot.z,
  );

  // Subtle index finger pointing during Tashahhud
  rig.rightIndexFinger.rotation.x = -pose.indexPointFactor * 0.9;
  rig.rightIndexFinger.position.z = -0.035 - pose.indexPointFactor * 0.025;

  rig.leftHip.rotation.set(pose.leftHipRot.x, pose.leftHipRot.y, pose.leftHipRot.z);
  rig.leftKnee.rotation.set(
    pose.leftKneeRot.x,
    pose.leftKneeRot.y,
    pose.leftKneeRot.z,
  );
  rig.leftAnkle.rotation.set(
    pose.leftAnkleRot.x,
    pose.leftAnkleRot.y,
    pose.leftAnkleRot.z,
  );
  rig.rightHip.rotation.set(
    pose.rightHipRot.x,
    pose.rightHipRot.y,
    pose.rightHipRot.z,
  );
  rig.rightKnee.rotation.set(
    pose.rightKneeRot.x,
    pose.rightKneeRot.y,
    pose.rightKneeRot.z,
  );
  rig.rightAnkle.rotation.set(
    pose.rightAnkleRot.x,
    pose.rightAnkleRot.y,
    pose.rightAnkleRot.z,
  );
};

const dampFullPose = (
  current: PosturePose,
  target: PosturePose,
  delta: number,
): PosturePose => {
  const lambda = 7.5;
  return {
    pelvisPos: dampVec3(current.pelvisPos, target.pelvisPos, lambda, delta),
    pelvisRot: dampVec3(current.pelvisRot, target.pelvisRot, lambda, delta),
    spineRot: dampVec3(current.spineRot, target.spineRot, lambda, delta),
    chestRot: dampVec3(current.chestRot, target.chestRot, lambda, delta),
    headRot: dampVec3(current.headRot, target.headRot, lambda, delta),
    leftShoulderRot: dampVec3(
      current.leftShoulderRot,
      target.leftShoulderRot,
      lambda,
      delta,
    ),
    leftElbowRot: dampVec3(
      current.leftElbowRot,
      target.leftElbowRot,
      lambda,
      delta,
    ),
    rightShoulderRot: dampVec3(
      current.rightShoulderRot,
      target.rightShoulderRot,
      lambda,
      delta,
    ),
    rightElbowRot: dampVec3(
      current.rightElbowRot,
      target.rightElbowRot,
      lambda,
      delta,
    ),
    leftHipRot: dampVec3(current.leftHipRot, target.leftHipRot, lambda, delta),
    leftKneeRot: dampVec3(current.leftKneeRot, target.leftKneeRot, lambda, delta),
    leftAnkleRot: dampVec3(
      current.leftAnkleRot,
      target.leftAnkleRot,
      lambda,
      delta,
    ),
    rightHipRot: dampVec3(current.rightHipRot, target.rightHipRot, lambda, delta),
    rightKneeRot: dampVec3(
      current.rightKneeRot,
      target.rightKneeRot,
      lambda,
      delta,
    ),
    rightAnkleRot: dampVec3(
      current.rightAnkleRot,
      target.rightAnkleRot,
      lambda,
      delta,
    ),
    indexPointFactor: dampValue(
      current.indexPointFactor,
      target.indexPointFactor,
      lambda,
      delta,
    ),
    showSevenPointMarkers: target.showSevenPointMarkers,
    showRukuAngleGuide: target.showRukuAngleGuide,
  };
};

export const createPrayerScene = (
  options: PrayerSceneOptions,
): Result<PrayerSceneController, AppError> => {
  const { container } = options;
  const probe = detectSoftwareWebGL();
  if (!probe.supported) {
    return err(
      createAppError(
        'WEBGL_UNAVAILABLE',
        'WebGL is unavailable in this browser context. Switched to schematic posture mode.',
        'WebGL est indisponible dans ce navigateur. Mode schématique activé.',
        { severity: 'warning', recoverable: true },
      ),
    );
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !probe.isSoftwareGl,
      powerPreference: 'high-performance',
    });
  } catch {
    return err(
      createAppError(
        'WEBGL_UNAVAILABLE',
        'Failed to create WebGLRenderer. Switched to schematic posture mode.',
        'Échec d’initialisation WebGLRenderer. Mode schématique activé.',
        { severity: 'warning', recoverable: true },
      ),
    );
  }

  const isSoftwareGl = probe.isSoftwareGl;
  const width = Math.max(container.clientWidth, 300);
  const height = Math.max(container.clientHeight, 260);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(
    isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
  );
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2efe9);
  scene.fog = new THREE.FogExp2(0xf2efe9, 0.042);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  scene.environment = envTexture;
  pmremGenerator.dispose();

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 45);
  const initialCamSpec = getCameraPresetSpec(
    options.initialCameraPreset,
    options.initialStepId,
  );
  camera.position.set(
    initialCamSpec.position.x,
    initialCamSpec.position.y,
    initialCamSpec.position.z,
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !isSoftwareGl;
  controls.dampingFactor = 0.07;
  controls.minDistance = 1.0;
  controls.maxDistance = 5.5;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  controls.target.set(
    initialCamSpec.target.x,
    initialCamSpec.target.y,
    initialCamSpec.target.z,
  );
  controls.update();

  // Warm / Cool Studio 3-point Rig
  const hemiLight = new THREE.HemisphereLight(0xddebf7, 0xc3b5a0, 0.9);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.9);
  keyLight.position.set(2.8, 4.4, 2.6);
  keyLight.castShadow = !isSoftwareGl;
  keyLight.shadow.mapSize.set(isSoftwareGl ? 512 : 2048, isSoftwareGl ? 512 : 2048);
  keyLight.shadow.camera.left = -2.8;
  keyLight.shadow.camera.right = 2.8;
  keyLight.shadow.camera.top = 2.8;
  keyLight.shadow.camera.bottom = -2.8;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 14;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xc2e2d8, 0.85);
  rimLight.position.set(-2.4, 2.5, -2.8);
  scene.add(rimLight);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const disposables: Array<{ dispose: () => void }> = [envTexture];

  // Limestone Floor
  const floorTex = createLimestoneFloorTexture(maxAniso);
  disposables.push(floorTex);
  const floorGeo = new THREE.PlaneGeometry(24, 24);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.85,
    metalness: 0.02,
  });
  disposables.push(floorGeo, floorMat);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = !isSoftwareGl;
  scene.add(floorMesh);

  // Soft radial contact shadow under prayer mat & figure
  const contactTex = createContactShadowTexture();
  disposables.push(contactTex);
  const contactGeo = new THREE.PlaneGeometry(1.4, 1.9);
  const contactMat = new THREE.MeshBasicMaterial({
    map: contactTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.65,
  });
  disposables.push(contactGeo, contactMat);
  const contactPlane = new THREE.Mesh(contactGeo, contactMat);
  contactPlane.rotation.x = -Math.PI / 2;
  contactPlane.position.y = 0.005;
  scene.add(contactPlane);

  // Woven Prayer Mat (Sajjadah)
  const matTex = createPrayerMatTexture(maxAniso);
  disposables.push(matTex);
  const matGeo = new THREE.BoxGeometry(0.84, 0.016, 1.42);
  const matTopMaterial = new THREE.MeshStandardMaterial({
    map: matTex,
    roughness: 0.92,
    metalness: 0.02,
  });
  const matSideMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b493d,
    roughness: 0.9,
    metalness: 0.02,
  });
  disposables.push(matGeo, matTopMaterial, matSideMaterial);
  const prayerMat = new THREE.Mesh(matGeo, [
    matSideMaterial,
    matSideMaterial,
    matTopMaterial,
    matSideMaterial,
    matSideMaterial,
    matSideMaterial,
  ]);
  prayerMat.position.set(0, 0.018, -0.18);
  prayerMat.receiveShadow = !isSoftwareGl;
  scene.add(prayerMat);

  // Arched Mihrab Architectural Backdrop (Multi-Part Group)
  const mihrabGroup = new THREE.Group();
  mihrabGroup.position.set(0, 0, -1.65);
  scene.add(mihrabGroup);

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xe3ddd1,
    roughness: 0.78,
    metalness: 0.04,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xb5893a,
    roughness: 0.24,
    metalness: 0.88,
  });
  const nicheMat = new THREE.MeshStandardMaterial({
    color: 0xd5cec0,
    roughness: 0.82,
    metalness: 0.02,
  });
  disposables.push(stoneMat, brassMat, nicheMat);

  const archShape = new THREE.Shape();
  archShape.moveTo(-0.85, 0);
  archShape.lineTo(-0.85, 2.45);
  archShape.lineTo(0.85, 2.45);
  archShape.lineTo(0.85, 0);
  archShape.lineTo(0.56, 0);
  archShape.lineTo(0.56, 1.65);
  archShape.quadraticCurveTo(0.56, 2.08, 0, 2.22);
  archShape.quadraticCurveTo(-0.56, 2.08, -0.56, 1.65);
  archShape.lineTo(-0.56, 0);
  archShape.closePath();

  const archGeo = new THREE.ExtrudeGeometry(archShape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  disposables.push(archGeo);
  const archFrame = new THREE.Mesh(archGeo, stoneMat);
  archFrame.receiveShadow = !isSoftwareGl;
  archFrame.castShadow = !isSoftwareGl;
  mihrabGroup.add(archFrame);

  const nicheBackGeo = new THREE.BoxGeometry(1.2, 2.26, 0.04);
  disposables.push(nicheBackGeo);
  const nicheBack = new THREE.Mesh(nicheBackGeo, nicheMat);
  nicheBack.position.set(0, 1.13, -0.02);
  mihrabGroup.add(nicheBack);

  const colGeo = new THREE.CylinderGeometry(0.07, 0.08, 1.75, 16);
  disposables.push(colGeo);
  for (const x of [-0.62, 0.62]) {
    const col = new THREE.Mesh(colGeo, stoneMat);
    col.position.set(x, 0.875, 0.18);
    col.castShadow = !isSoftwareGl;
    mihrabGroup.add(col);
  }

  // Brass Lantern inside Mihrab arch
  const lanternCordGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.45, 8);
  const lanternBodyGeo = new THREE.CylinderGeometry(0.075, 0.045, 0.16, 6);
  disposables.push(lanternCordGeo, lanternBodyGeo);
  const lanternCord = new THREE.Mesh(lanternCordGeo, brassMat);
  lanternCord.position.set(0, 1.98, 0.08);
  mihrabGroup.add(lanternCord);
  const lanternBody = new THREE.Mesh(lanternBodyGeo, brassMat);
  lanternBody.position.set(0, 1.72, 0.08);
  mihrabGroup.add(lanternBody);

  // Articulated 14-part Figure
  const { rig, disposables: figDisposables } = buildArticulatedFigure(
    !isSoftwareGl,
  );
  disposables.push(...figDisposables);
  scene.add(rig.root);

  // Alignment Guides Group (Qiblah vector, 7 Sujud rings, 90° Ruku back plane)
  const guidesGroup = new THREE.Group();
  guidesGroup.visible = options.showAlignmentGuides;
  scene.add(guidesGroup);

  const qiblahArrowMat = new THREE.MeshStandardMaterial({
    color: 0x0f5c4d,
    roughness: 0.4,
    metalness: 0.2,
  });
  const highlightMat = new THREE.MeshBasicMaterial({
    color: 0xb5893a,
    transparent: true,
    opacity: 0.85,
  });
  disposables.push(qiblahArrowMat, highlightMat);

  // Qiblah direction arrow at front of mat
  const arrowShaftGeo = new THREE.BoxGeometry(0.025, 0.008, 0.26);
  const arrowHeadGeo = new THREE.ConeGeometry(0.055, 0.12, 3);
  disposables.push(arrowShaftGeo, arrowHeadGeo);
  const arrowShaft = new THREE.Mesh(arrowShaftGeo, qiblahArrowMat);
  arrowShaft.position.set(0, 0.03, -0.98);
  guidesGroup.add(arrowShaft);
  const arrowHead = new THREE.Mesh(arrowHeadGeo, qiblahArrowMat);
  arrowHead.rotation.x = -Math.PI / 2;
  arrowHead.position.set(0, 0.032, -1.14);
  guidesGroup.add(arrowHead);

  // 7-point Sujud ground markers
  const sujudMarkersGroup = new THREE.Group();
  guidesGroup.add(sujudMarkersGroup);
  const ringGeo = new THREE.RingGeometry(0.04, 0.058, 24);
  disposables.push(ringGeo);
  const sujudCoords: [number, number][] = [
    [0, -0.58], // Forehead & nose
    [-0.19, -0.45], // Left palm
    [0.19, -0.45], // Right palm
    [-0.1, -0.05], // Left knee
    [0.1, -0.05], // Right knee
    [-0.09, 0.34], // Left toes
    [0.09, 0.34], // Right toes
  ];
  for (const [mx, mz] of sujudCoords) {
    const ring = new THREE.Mesh(ringGeo, highlightMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(mx, 0.032, mz);
    sujudMarkersGroup.add(ring);
  }

  // Ruku 90° dorsal alignment bar
  const rukuGuideGroup = new THREE.Group();
  guidesGroup.add(rukuGuideGroup);
  const rukuBarGeo = new THREE.BoxGeometry(0.015, 0.015, 0.65);
  disposables.push(rukuBarGeo);
  const rukuBar = new THREE.Mesh(rukuBarGeo, highlightMat);
  rukuBar.position.set(0.24, 0.96, -0.26);
  rukuGuideGroup.add(rukuBar);

  // Pose & camera transition state
  let currentPose: PosturePose = getPoseForStep(options.initialStepId);
  let targetPose: PosturePose = currentPose;
  applyPoseToRig(rig, currentPose);
  sujudMarkersGroup.visible = currentPose.showSevenPointMarkers;
  rukuGuideGroup.visible = currentPose.showRukuAngleGuide;

  let cameraAnimating = false;
  let poseAnimating = false;
  let disposed = false;
  let frameId = 0;
  let syncTimeoutId = 0;
  let renderBusy = false;
  let renderDirty = false;
  let lastTime = performance.now();

  controls.addEventListener('start', () => {
    cameraAnimating = false;
  });

  const cancelPendingFrames = () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
    if (syncTimeoutId) {
      window.clearTimeout(syncTimeoutId);
      syncTimeoutId = 0;
    }
  };

  const afterDraw = (cb: () => void) => {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          syncTimeoutId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          syncTimeoutId = window.setTimeout(cb, 80);
        }
      };
      syncTimeoutId = window.setTimeout(poll, 5);
    } else {
      syncTimeoutId = window.setTimeout(cb, 80);
    }
  };

  const requestRender = () => {
    if (disposed) return;
    if (renderBusy) {
      renderDirty = true;
      return;
    }
    renderBusy = true;
    frameId = requestAnimationFrame(() => {
      if (disposed) return;
      renderDirty = false;
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const delta = Math.min(Math.max(rawDt, 0.001), 0.05);

      if (poseAnimating) {
        currentPose = dampFullPose(currentPose, targetPose, delta);
        applyPoseToRig(rig, currentPose);
        if (isPoseSettled(currentPose, targetPose)) {
          currentPose = targetPose;
          applyPoseToRig(rig, currentPose);
          poseAnimating = false;
        }
      }

      if (cameraAnimating) {
        const camLambda = 6.5;
        const factor = 1 - Math.exp(-camLambda * delta);
        camera.position.lerp(_camPosTarget, factor);
        controls.target.lerp(_camLookTarget, factor);
        if (
          camera.position.distanceTo(_camPosTarget) < 0.01 &&
          controls.target.distanceTo(_camLookTarget) < 0.01
        ) {
          camera.position.copy(_camPosTarget);
          controls.target.copy(_camLookTarget);
          cameraAnimating = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      const done = () => {
        renderBusy = false;
        if (!disposed && (renderDirty || poseAnimating || cameraAnimating)) {
          requestRender();
        }
      };

      if (isSoftwareGl) {
        afterDraw(done);
      } else {
        done();
      }
    });
  };

  controls.addEventListener('change', () => {
    if (!poseAnimating && !cameraAnimating) {
      requestRender();
    }
  });

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    cancelPendingFrames();
    options.onContextLost?.(
      createAppError(
        'WEBGL_CONTEXT_LOST',
        'WebGL rendering context was interrupted. Switched to schematic view.',
        'Le contexte WebGL a été interrompu. Bascule en vue schématique.',
        { severity: 'warning', recoverable: true },
      ),
    );
  };
  renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }
  requestRender();

  return ok({
    setStep: (stepId: PostureId) => {
      targetPose = getPoseForStep(stepId);
      sujudMarkersGroup.visible = targetPose.showSevenPointMarkers;
      rukuGuideGroup.visible = targetPose.showRukuAngleGuide;
      poseAnimating = true;
      lastTime = performance.now();
      requestRender();
    },
    setCameraPreset: (preset: CameraPreset) => {
      const spec = getCameraPresetSpec(preset, 'qiyam_ready');
      // Adjust target Y dynamically based on current target posture
      const isLow =
        targetPose.showSevenPointMarkers || targetPose.pelvisPos.y < 0.5;
      const tuned = getCameraPresetSpec(
        preset,
        isLow ? 'sujud_1' : 'qiyam_ready',
      );
      _camPosTarget.set(
        tuned.position.x || spec.position.x,
        tuned.position.y,
        tuned.position.z,
      );
      _camLookTarget.set(tuned.target.x, tuned.target.y, tuned.target.z);
      cameraAnimating = true;
      lastTime = performance.now();
      requestRender();
    },
    setAlignmentGuides: (visible: boolean) => {
      guidesGroup.visible = visible;
      requestRender();
    },
    resize: () => {
      if (disposed) return;
      const w = Math.max(container.clientWidth, 300);
      const h = Math.max(container.clientHeight, 260);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    },
    dispose: () => {
      disposed = true;
      cancelPendingFrames();
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        handleContextLost,
      );
      controls.dispose();
      for (const item of disposables) {
        item.dispose();
      }
      renderer.dispose();
      container.innerHTML = '';
    },
  });
};
