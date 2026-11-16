export type Language = 'en' | 'fr';

export interface LocalizedText {
  readonly en: string;
  readonly fr: string;
}

export const pickText = (lang: Language, text: LocalizedText): string =>
  lang === 'fr' ? text.fr : text.en;

export const UI_COPY = {
  brand: { en: 'Mihrab', fr: 'Mihrab' },
  nav: {
    overview: { en: 'Overview', fr: 'Aperçu' },
    diagrams: { en: 'Diagrams', fr: 'Diagrammes' },
    guide3d: { en: '3D Guide', fr: 'Guide 3D' },
    matrix: { en: 'Rules Matrix', fr: 'Référentiel' },
  },
  cta: {
    start3d: { en: 'Open 3D Guide', fr: 'Ouvrir le Guide 3D' },
    exploreDiagram: { en: 'Explore Diagrams', fr: 'Explorer les Diagrammes' },
  },
  hero: {
    kicker: {
      en: 'Architectural Fiqh · Spatial Posture Visuals',
      fr: 'Fiqh Architectural · Guidage Spatial 3D',
    },
    title: {
      en: 'Understand Every Condition, Pillar, Obligation & Posture of Salah',
      fr: 'Maîtrisez Chaque Condition, Pilier, Obligation et Posture de la Prière',
    },
    subtitle: {
      en: 'An interactive study pairing structured Islamic jurisprudence diagrams with an articulated 3D posture model to guide every movement clearly.',
      fr: 'Une étude interactive associant des diagrammes de jurisprudence structurés à un modèle 3D articulé pour guider chaque posture avec clarté.',
    },
    metrics: {
      conditionsCount: { en: '9 Conditions', fr: '9 Conditions' },
      conditionsDesc: { en: 'Pre-prayer prerequisites (Shurut)', fr: 'Prérequis avant la prière (Shurut)' },
      pillarsCount: { en: '14 Pillars', fr: '14 Piliers' },
      pillarsDesc: { en: 'Essential core acts (Arkan)', fr: 'Actes fondamentaux (Arkan)' },
      obligationsCount: { en: '8 Obligations', fr: '8 Obligations' },
      obligationsDesc: { en: 'Mandatory acts (Wajibat)', fr: 'Actes obligatoires (Wajibat)' },
      posturesCount: { en: '10 3D Postures', fr: '10 Postures 3D' },
      posturesDesc: { en: 'Articulated step-by-step guidance', fr: 'Guidage articulé étape par étape' },
    },
  },
  categories: {
    all: { en: 'All Elements', fr: 'Tous les éléments' },
    condition: { en: 'Condition (Shart)', fr: 'Condition (Shart)' },
    pillar: { en: 'Pillar (Rukn)', fr: 'Pilier (Rukn)' },
    obligation: { en: 'Obligation (Wajib)', fr: 'Obligation (Wajib)' },
    sunnah: { en: 'Recommended (Sunnah)', fr: 'Recommandé (Sunnah)' },
  },
  diagrams: {
    title: {
      en: 'Interactive Jurisprudence Diagrams',
      fr: 'Diagrammes Interactifs de la Prière',
    },
    subtitle: {
      en: 'Switch between the structural foundation diagram, omission decision flow, and complete Rak’ah cycle.',
      fr: 'Basculez entre la structure architecturale, l’arbre de décision en cas d’oubli et le cycle complet d’une Rak’ah.',
    },
    modes: {
      architecture: { en: 'Architecture & Hierarchy', fr: 'Architecture & Hiérarchie' },
      omission: { en: 'Omission Decision Flow', fr: 'Arbre d’Oubli (Sahw)' },
      cycle: { en: 'Rak’ah Sequence Graph', fr: 'Cycle d’une Rak’ah' },
    },
    simulateDeliberate: { en: 'Deliberate Omission', fr: 'Oubli Volontaire' },
    simulateForgetful: { en: 'Forgetful Omission', fr: 'Oubli Involontaire' },
    inspectIn3d: { en: 'Inspect Posture in 3D', fr: 'Voir la Posture en 3D' },
  },
  guide3d: {
    title: { en: '3D Spatial Posture Guide', fr: 'Guide Spatial 3D des Postures' },
    play: { en: 'Play', fr: 'Lecture' },
    pause: { en: 'Pause', fr: 'Pause' },
    prev: { en: 'Previous', fr: 'Précédent' },
    next: { en: 'Next', fr: 'Suivant' },
    reset: { en: 'Reset', fr: 'Réinitialiser' },
    hideControls: { en: 'Hide Controls', fr: 'Masquer' },
    showControls: { en: 'Show Controls', fr: 'Afficher' },
    alignmentGuides: { en: 'Alignment Guides', fr: 'Repères d’Alignement' },
    sceneRecitation: { en: 'What to Say', fr: 'Paroles' },
    whatToSayLabel: { en: 'What to say now', fr: 'À dire à cette étape' },
    cameraLabel: { en: 'Camera View', fr: 'Caméra' },
    speedLabel: { en: 'Speed', fr: 'Vitesse' },
    cameras: {
      threeQuarter: { en: '3/4 Front', fr: '3/4 Face' },
      profile: { en: 'Side Profile', fr: 'Profil' },
      top: { en: 'Top Qiblah', fr: 'Vue Dessus' },
      closeUp: { en: 'Close-Up', fr: 'Rapproché' },
    },
    prayerSelect: { en: 'Prayer Template', fr: 'Prière' },
    webglFallbackTitle: {
      en: '3D Viewport Unavailable — Schematic Mode Active',
      fr: 'Rendu 3D Indisponible — Mode Schématique Actif',
    },
    webglFallbackDesc: {
      en: 'WebGL hardware or software rendering could not initialize. Use the posture checkpoints and schematic diagram below.',
      fr: 'Le contexte WebGL n’a pas pu être initialisé. Utilisez les repères anatomiques et le schéma ci-dessous.',
    },
  },
  matrix: {
    title: {
      en: 'Conditions, Pillars & Obligations Reference',
      fr: 'Référentiel des Conditions, Piliers et Obligations',
    },
    subtitle: {
      en: 'Filter rules by classification, verify pre-prayer readiness, and inspect the exact ruling if an act is missed.',
      fr: 'Filtrez par catégorie juridique, vérifiez votre préparation avant la prière et consultez la règle en cas d’omission.',
    },
    searchPlaceholder: {
      en: 'Search by Arabic or English term...',
      fr: 'Rechercher par terme arabe ou français...',
    },
    readinessTitle: { en: 'Pre-Prayer Condition Checklist', fr: 'Vérification des Conditions (Shurut)' },
    readyStatus: { en: 'Ready to Commence Prayer', fr: 'Prêt pour Entrer en Prière' },
    notReadyStatus: { en: 'Complete All 9 Conditions First', fr: 'Complétez les 9 Conditions Avant' },
    resetChecklist: { en: 'Reset Checklist', fr: 'Réinitialiser' },
    markAllReady: { en: 'Verify All', fr: 'Tout Valider' },
  },
  errors: {
    dismiss: { en: 'Dismiss', fr: 'Fermer' },
    recoverHome: { en: 'Return to Overview', fr: 'Retour à l’Aperçu' },
  },
} as const;
