import type { FiqhCategory, PostureId } from '../prayer/prayerData';

export interface DiagramPoint {
  readonly x: number;
  readonly y: number;
}

export interface ArchitectureLayerNode {
  readonly id: FiqhCategory;
  readonly radius: number;
  readonly count: number;
  readonly glyph: string;
  readonly color: string;
  readonly fill: string;
}

export interface CycleDiagramNode {
  readonly id: PostureId;
  readonly order: number;
  readonly angleDeg: number;
  readonly x: number;
  readonly y: number;
  readonly category: FiqhCategory;
}

export interface DecisionBranchNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly kind: 'question' | 'branch' | 'outcome';
  readonly valid?: boolean;
}

export const ARCHITECTURE_RINGS: readonly ArchitectureLayerNode[] = [
  {
    id: 'pillar',
    radius: 78,
    count: 14,
    glyph: '●',
    color: '#0F5C4D',
    fill: '#ECFDF5',
  },
  {
    id: 'obligation',
    radius: 132,
    count: 8,
    glyph: '▲',
    color: '#B45309',
    fill: '#FFFBEB',
  },
  {
    id: 'condition',
    radius: 186,
    count: 9,
    glyph: '◆',
    color: '#0369A1',
    fill: '#F0F9FF',
  },
];

export const computeRingNodePositions = (
  cx: number,
  cy: number,
  radius: number,
  count: number,
  startAngleDeg = -90,
): readonly DiagramPoint[] =>
  Array.from({ length: count }, (_, idx) => {
    const angleRad =
      ((startAngleDeg + (360 / count) * idx) * Math.PI) / 180;
    return {
      x: Number((cx + Math.cos(angleRad) * radius).toFixed(2)),
      y: Number((cy + Math.sin(angleRad) * radius).toFixed(2)),
    };
  });

export const CYCLE_POSTURE_ORDER: readonly {
  readonly id: PostureId;
  readonly category: FiqhCategory;
}[] = [
  { id: 'qiyam_ready', category: 'condition' },
  { id: 'takbir_ihram', category: 'pillar' },
  { id: 'qiyam_qiraah', category: 'pillar' },
  { id: 'ruku', category: 'pillar' },
  { id: 'itidal', category: 'pillar' },
  { id: 'sujud_1', category: 'pillar' },
  { id: 'jalsa', category: 'pillar' },
  { id: 'sujud_2', category: 'pillar' },
  { id: 'tashahhud', category: 'obligation' },
  { id: 'taslim', category: 'pillar' },
];

export const computeCycleDiagramNodes = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): readonly CycleDiagramNode[] =>
  CYCLE_POSTURE_ORDER.map((item, index) => {
    const angleDeg = -90 + (360 / CYCLE_POSTURE_ORDER.length) * index;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      id: item.id,
      order: index + 1,
      angleDeg,
      x: Number((cx + Math.cos(rad) * rx).toFixed(2)),
      y: Number((cy + Math.sin(rad) * ry).toFixed(2)),
      category: item.category,
    };
  });

export const buildCurvedEdgePath = (
  from: DiagramPoint,
  to: DiagramPoint,
  center: DiagramPoint,
  pullFactor = 0.14,
): string => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const ctrlX = Number((midX + (midX - center.x) * pullFactor).toFixed(2));
  const ctrlY = Number((midY + (midY - center.y) * pullFactor).toFixed(2));
  return `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;
};

export const getCategoryColorToken = (
  category: FiqhCategory,
): { readonly stroke: string; readonly bg: string; readonly glyph: string } => {
  switch (category) {
    case 'condition':
      return { stroke: '#0369A1', bg: '#E0F2FE', glyph: '◆' };
    case 'pillar':
      return { stroke: '#0F5C4D', bg: '#D1FAE5', glyph: '●' };
    case 'obligation':
      return { stroke: '#B45309', bg: '#FEF3C7', glyph: '▲' };
    case 'sunnah':
      return { stroke: '#475569', bg: '#F1F5F9', glyph: '○' };
  }
};
