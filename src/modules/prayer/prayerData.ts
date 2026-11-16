import type { LocalizedText } from '../i18n/translations';

export type FiqhCategory = 'condition' | 'pillar' | 'obligation' | 'sunnah';

export type PostureId =
  | 'qiyam_ready'
  | 'takbir_ihram'
  | 'qiyam_qiraah'
  | 'ruku'
  | 'itidal'
  | 'sujud_1'
  | 'jalsa'
  | 'sujud_2'
  | 'tashahhud'
  | 'taslim';

export interface FiqhRuleItem {
  readonly id: string;
  readonly index: number;
  readonly category: Exclude<FiqhCategory, 'sunnah'>;
  readonly arabic: string;
  readonly transliteration: string;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  readonly ifMissedDeliberately: LocalizedText;
  readonly ifMissedForgetfully: LocalizedText;
  readonly linkedPostureId?: PostureId;
}

export interface PrayerStep {
  readonly id: PostureId;
  readonly order: number;
  readonly category: FiqhCategory;
  readonly arabicName: string;
  readonly transliteration: string;
  readonly title: LocalizedText;
  readonly recitationArabic: string;
  readonly recitationTranslit: string;
  readonly recitationMeaning: LocalizedText;
  readonly speechCue: {
    readonly mode: 'silent' | 'spoken';
    readonly instruction: LocalizedText;
  };
  readonly postureSummary: LocalizedText;
  readonly checkpoints: readonly LocalizedText[];
  readonly alignmentNote: LocalizedText;
  readonly linkedRuleIds: readonly string[];
}

export interface DailyPrayerDefinition {
  readonly id: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  readonly arabic: string;
  readonly name: LocalizedText;
  readonly rakahs: 2 | 3 | 4;
  readonly timeWindow: LocalizedText;
}

export const DAILY_PRAYERS: readonly DailyPrayerDefinition[] = [
  {
    id: 'fajr',
    arabic: 'الفجر',
    name: { en: 'Fajr', fr: 'Fajr (Aube)' },
    rakahs: 2,
    timeWindow: { en: 'Dawn to Sunrise', fr: 'De l’aube au lever du soleil' },
  },
  {
    id: 'dhuhr',
    arabic: 'الظهر',
    name: { en: 'Dhuhr', fr: 'Dhuhr (Midi)' },
    rakahs: 4,
    timeWindow: { en: 'Solar Noon to Mid-Afternoon', fr: 'Zénith jusqu’à l’Asr' },
  },
  {
    id: 'asr',
    arabic: 'العصر',
    name: { en: 'Asr', fr: 'Asr (Après-midi)' },
    rakahs: 4,
    timeWindow: { en: 'Mid-Afternoon to Sunset', fr: 'Milieu d’après-midi au coucher' },
  },
  {
    id: 'maghrib',
    arabic: 'المغرب',
    name: { en: 'Maghrib', fr: 'Maghrib (Coucher)' },
    rakahs: 3,
    timeWindow: { en: 'Sunset to Dusk', fr: 'Coucher du soleil au crépuscule' },
  },
  {
    id: 'isha',
    arabic: 'العشاء',
    name: { en: 'Isha', fr: 'Isha (Nuit)' },
    rakahs: 4,
    timeWindow: { en: 'Nightfall to Midnight / Dawn', fr: 'Tombée de la nuit à l’aube' },
  },
];

export const SHURUT_CONDITIONS: readonly FiqhRuleItem[] = [
  {
    id: 'shart-1',
    index: 1,
    category: 'condition',
    arabic: 'الإسلام',
    transliteration: 'Al-Islam',
    title: { en: 'Being Muslim', fr: 'L’Islam' },
    summary: {
      en: 'Prayer is an act of worship founded upon faith and testimony.',
      fr: 'La prière est un acte d’adoration fondé sur la foi et l’attestation.',
    },
    ifMissedDeliberately: {
      en: 'Prayer is not accepted without faith.',
      fr: 'La prière n’est pas valide sans la foi.',
    },
    ifMissedForgetfully: {
      en: 'Prerequisite state prior to worship.',
      fr: 'État préalable requis avant l’acte d’adoration.',
    },
  },
  {
    id: 'shart-2',
    index: 2,
    category: 'condition',
    arabic: 'العقل',
    transliteration: 'Al-Aql',
    title: { en: 'Sanity & Awareness', fr: 'La Raison (Lucidité)' },
    summary: {
      en: 'The worshipper must possess sound intellect and conscious awareness.',
      fr: 'Le fidèle doit jouir de ses facultés mentales et de lucidité.',
    },
    ifMissedDeliberately: {
      en: 'Obligation is lifted if intellect is absent.',
      fr: 'L’obligation est levée en l’absence de discernement.',
    },
    ifMissedForgetfully: {
      en: 'Must be conscious throughout the prayer.',
      fr: 'La conscience est requise durant toute la prière.',
    },
  },
  {
    id: 'shart-3',
    index: 3,
    category: 'condition',
    arabic: 'التمييز',
    transliteration: 'At-Tamyiz',
    title: { en: 'Age of Discernment', fr: 'Le Discernement' },
    summary: {
      en: 'Understanding the purpose and basic actions of prayer (typically age seven).',
      fr: 'Comprendre le sens et les gestes essentiels de la prière (vers sept ans).',
    },
    ifMissedDeliberately: {
      en: 'Not valid prior to discernment.',
      fr: 'Non valide avant l’âge de discernement.',
    },
    ifMissedForgetfully: {
      en: 'Prerequisite developmental threshold.',
      fr: 'Seuil préalable de compréhension.',
    },
  },
  {
    id: 'shart-4',
    index: 4,
    category: 'condition',
    arabic: 'رفع الحدث',
    transliteration: 'Raf’ al-Hadath (Wudu)',
    title: { en: 'Ritual Purity (Wudu / Ghusl)', fr: 'Pureté Rituelle (Wudu / Ghusl)' },
    summary: {
      en: 'Performing ablution (Wudu) or full purification (Ghusl) when required.',
      fr: 'Accomplir les ablutions (Wudu) ou le bain rituel (Ghusl) si nécessaire.',
    },
    ifMissedDeliberately: {
      en: 'Prayer is invalid and must be repeated after purification.',
      fr: 'La prière est invalide et doit être refaite après purification.',
    },
    ifMissedForgetfully: {
      en: 'Still invalid; purify immediately and repeat the prayer.',
      fr: 'Reste invalide ; il faut se purifier et recommencer la prière.',
    },
    linkedPostureId: 'qiyam_ready',
  },
  {
    id: 'shart-5',
    index: 5,
    category: 'condition',
    arabic: 'إزالة النجاسة',
    transliteration: 'Izalat an-Najasah',
    title: { en: 'Purity of Body, Garment & Spot', fr: 'Propreté du Corps, Habit & Lieu' },
    summary: {
      en: 'Ensuring body, clothes, and prayer mat are free from physical impurities.',
      fr: 'S’assurer que le corps, les vêtements et le tapis sont exempts d’impuretés.',
    },
    ifMissedDeliberately: {
      en: 'Prayer is invalid if impurity is knowingly kept.',
      fr: 'La prière est invalide si une impureté connue est conservée.',
    },
    ifMissedForgetfully: {
      en: 'If discovered after prayer, prayer remains valid; if during, remove if possible.',
      fr: 'Si découverte après, la prière reste valide ; pendant, la retirer si possible.',
    },
    linkedPostureId: 'qiyam_ready',
  },
  {
    id: 'shart-6',
    index: 6,
    category: 'condition',
    arabic: 'ستر العورة',
    transliteration: 'Satr al-Awrah',
    title: { en: 'Modest Covering (Awrah)', fr: 'Couvrir la Nudité (Awrah)' },
    summary: {
      en: 'Wearing clean, opaque, modest attire appropriate for standing before God.',
      fr: 'Porter une tenue propre, opaque et décente adaptée à la prière.',
    },
    ifMissedDeliberately: {
      en: 'Prayer is invalid if Awrah is intentionally uncovered.',
      fr: 'La prière est invalide si la Awrah est volontairement découverte.',
    },
    ifMissedForgetfully: {
      en: 'Cover immediately upon noticing; major exposure invalidates.',
      fr: 'Couvrir dès que remarqué ; une exposition majeure invalide.',
    },
  },
  {
    id: 'shart-7',
    index: 7,
    category: 'condition',
    arabic: 'دخول الوقت',
    transliteration: 'Dukhul al-Waqt',
    title: { en: 'Arrival of Prayer Time', fr: 'Entrée de l’Heure Légale' },
    summary: {
      en: 'Confirming the designated time window for the specific prayer has begun.',
      fr: 'Vérifier que la plage horaire de la prière concernée a bien commencé.',
    },
    ifMissedDeliberately: {
      en: 'Prayer performed before its time is invalid as that obligatory prayer.',
      fr: 'Prier avant l’heure invalide l’accomplissement de la prière obligatoire.',
    },
    ifMissedForgetfully: {
      en: 'Invalid as Fard; must be prayed again once time enters.',
      fr: 'Invalide comme Fard ; doit être accomplie une fois l’heure entrée.',
    },
  },
  {
    id: 'shart-8',
    index: 8,
    category: 'condition',
    arabic: 'استقبال القبلة',
    transliteration: 'Istiqbal al-Qiblah',
    title: { en: 'Facing the Qiblah', fr: 'S’Orienter vers la Qiblah' },
    summary: {
      en: 'Orienting the chest and feet toward the Kaaba in Makkah.',
      fr: 'Orienter le buste et les pieds en direction de la Kaaba à La Mecque.',
    },
    ifMissedDeliberately: {
      en: 'Prayer is invalid when able to face the Qiblah.',
      fr: 'La prière est invalide si l’on pouvait s’orienter vers la Qiblah.',
    },
    ifMissedForgetfully: {
      en: 'Valid if diligent effort was made to determine direction.',
      fr: 'Valide si un effort sincère de recherche d’orientation a été fait.',
    },
    linkedPostureId: 'qiyam_ready',
  },
  {
    id: 'shart-9',
    index: 9,
    category: 'condition',
    arabic: 'النية',
    transliteration: 'An-Niyyah',
    title: { en: 'Sincere Intention (Niyyah)', fr: 'L’Intention (Niyyah)' },
    summary: {
      en: 'Resolving in the heart which prayer is about to be performed (e.g., Dhuhr, 4 Rak’ahs).',
      fr: 'Formuler dans le cœur l’intention précise de la prière à accomplir.',
    },
    ifMissedDeliberately: {
      en: 'Actions have no validity without intention.',
      fr: 'Les actes ne sont valides qu’avec l’intention du cœur.',
    },
    ifMissedForgetfully: {
      en: 'Prayer is invalid without a conscious intention.',
      fr: 'La prière est invalide sans intention consciente.',
    },
    linkedPostureId: 'qiyam_ready',
  },
];

export const ARKAN_PILLARS: readonly FiqhRuleItem[] = [
  {
    id: 'rukn-1',
    index: 1,
    category: 'pillar',
    arabic: 'القيام مع القدرة',
    transliteration: 'Al-Qiyam',
    title: { en: 'Standing (When Able)', fr: 'La Station Debout (Qiyam)' },
    summary: {
      en: 'Standing upright in obligatory prayers if physically capable.',
      fr: 'Se tenir debout droit dans les prières obligatoires si l’on en est capable.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the obligatory prayer.',
      fr: 'Invalide la prière obligatoire.',
    },
    ifMissedForgetfully: {
      en: 'Return to standing immediately; perform Sujud al-Sahw.',
      fr: 'Revenir debout immédiatement et effectuer le Sujud al-Sahw.',
    },
    linkedPostureId: 'qiyam_ready',
  },
  {
    id: 'rukn-2',
    index: 2,
    category: 'pillar',
    arabic: 'تكبيرة الإحرام',
    transliteration: 'Takbiratul Ihram',
    title: { en: 'Opening Takbir ("Allahu Akbar")', fr: 'Takbir d’Ouverture (Ihram)' },
    summary: {
      en: 'Saying "Allahu Akbar" while raising the hands to officially enter Salah.',
      fr: 'Prononcer « Allahu Akbar » en levant les mains pour entrer en prière.',
    },
    ifMissedDeliberately: {
      en: 'Prayer never commences without Takbiratul Ihram.',
      fr: 'La prière ne commence jamais sans le Takbiratul Ihram.',
    },
    ifMissedForgetfully: {
      en: 'Prayer has not started; must say it from the beginning.',
      fr: 'La prière n’a pas commencé ; il faut le prononcer au début.',
    },
    linkedPostureId: 'takbir_ihram',
  },
  {
    id: 'rukn-3',
    index: 3,
    category: 'pillar',
    arabic: 'قراءة الفاتحة',
    transliteration: 'Qira’at al-Fatihah',
    title: { en: 'Reciting Surah Al-Fatihah', fr: 'Récitation d’Al-Fatihah' },
    summary: {
      en: 'Reciting the Opening Chapter in every Rak’ah standing upright.',
      fr: 'Réciter la sourate d’ouverture Al-Fatihah dans chaque Rak’ah.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the Rak’ah and prayer.',
      fr: 'Invalide la Rak’ah et la prière.',
    },
    ifMissedForgetfully: {
      en: 'Must recite it before Ruku, or repeat the Rak’ah if already past Ruku.',
      fr: 'La réciter avant le Ruku, ou refaire la Rak’ah si le Ruku est dépassé.',
    },
    linkedPostureId: 'qiyam_qiraah',
  },
  {
    id: 'rukn-4',
    index: 4,
    category: 'pillar',
    arabic: 'الركوع',
    transliteration: 'Ar-Ruku',
    title: { en: 'Bowing (Ruku)', fr: 'L’Inclinaison (Ruku)' },
    summary: {
      en: 'Bowing until the back is level and hands firmly grasp the knees.',
      fr: 'S’incliner dos droit et plat, paumes posées sur les genoux.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière.',
    },
    ifMissedForgetfully: {
      en: 'Return to bow if remembered before next Rak’ah’s Ruku, then Sujud Sahw.',
      fr: 'Revenir à l’inclinaison si rappelé avant la suivante, puis Sujud Sahw.',
    },
    linkedPostureId: 'ruku',
  },
  {
    id: 'rukn-5',
    index: 5,
    category: 'pillar',
    arabic: 'الرفع من الركوع',
    transliteration: 'Ar-Raf’ min ar-Ruku',
    title: { en: 'Rising from Bowing', fr: 'Le Relèvement du Ruku' },
    summary: {
      en: 'Returning fully upright from bowing before descending to prostration.',
      fr: 'Se redresser complètement à la verticale après l’inclinaison.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière.',
    },
    ifMissedForgetfully: {
      en: 'Must be restored; repeat sequence from this pillar + Sujud Sahw.',
      fr: 'Doit être rétabli ; reprendre depuis ce pilier + Sujud Sahw.',
    },
    linkedPostureId: 'itidal',
  },
  {
    id: 'rukn-6',
    index: 6,
    category: 'pillar',
    arabic: 'الاعتدال قائماً',
    transliteration: 'Al-I’tidal Qa’iman',
    title: { en: 'Standing Straight After Ruku', fr: 'La Station Droite (I’tidal)' },
    summary: {
      en: 'Pausing upright with composure until every vertebra settles.',
      fr: 'Marquer un temps d’arrêt droit afin que chaque articulation se stabilise.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière.',
    },
    ifMissedForgetfully: {
      en: 'Restore pillar or repeat Rak’ah + Sujud Sahw.',
      fr: 'Rétablir le pilier ou refaire la Rak’ah + Sujud Sahw.',
    },
    linkedPostureId: 'itidal',
  },
  {
    id: 'rukn-7',
    index: 7,
    category: 'pillar',
    arabic: 'السجود على الأعضاء السبعة',
    transliteration: 'As-Sujud',
    title: { en: 'Prostration on 7 Bones', fr: 'La Prosternation sur 7 Membres' },
    summary: {
      en: 'Forehead & nose, both palms, both knees, and toes of both feet grounded.',
      fr: 'Front et nez, deux paumes, deux genoux et orteils des deux pieds au sol.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière.',
    },
    ifMissedForgetfully: {
      en: 'Must return to perform the missed prostration + Sujud Sahw.',
      fr: 'Revenir accomplir la prosternation omise + Sujud Sahw.',
    },
    linkedPostureId: 'sujud_1',
  },
  {
    id: 'rukn-8',
    index: 8,
    category: 'pillar',
    arabic: 'الرفع من السجود',
    transliteration: 'Ar-Raf’ min as-Sujud',
    title: { en: 'Rising from Prostration', fr: 'Se Relever du Sujud' },
    summary: {
      en: 'Lifting the forehead and torso into the seated posture between prostrations.',
      fr: 'Relever le front et le buste pour s’asseoir entre les prosternations.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière.',
    },
    ifMissedForgetfully: {
      en: 'Must sit upright before performing the second prostration.',
      fr: 'S’asseoir droit avant d’accomplir la seconde prosternation.',
    },
    linkedPostureId: 'jalsa',
  },
  {
    id: 'rukn-9',
    index: 9,
    category: 'pillar',
    arabic: 'الجلوس بين السجدتين',
    transliteration: 'Al-Jalsa bayn as-Sajdatayn',
    title: { en: 'Sitting Between Prostrations', fr: 'L’Assise entre deux Sujud' },
    summary: {
      en: 'Sitting upright in Iftirash (on left foot, right foot upright) with calm.',
      fr: 'S’asseoir calmement entre les deux prosternations (position Iftirash).',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière.',
    },
    ifMissedForgetfully: {
      en: 'Must sit upright and perform Sujud Sahw.',
      fr: 'S’asseoir droit puis accomplir le Sujud Sahw.',
    },
    linkedPostureId: 'jalsa',
  },
  {
    id: 'rukn-10',
    index: 10,
    category: 'pillar',
    arabic: 'الطمأنينة في جميع الأركان',
    transliteration: 'At-Tuma’ninah',
    title: { en: 'Tranquility & Stillness', fr: 'La Sérénité & Stabilité (Tuma’ninah)' },
    summary: {
      en: 'Pausing smoothly in every posture so joints settle without rushing.',
      fr: 'Marquer une pause stable dans chaque posture sans précipitation.',
    },
    ifMissedDeliberately: {
      en: 'Rushing without stillness invalidates the prayer.',
      fr: 'La précipitation sans pause invalide la prière.',
    },
    ifMissedForgetfully: {
      en: 'Repeat the rushed pillar calmly + Sujud Sahw.',
      fr: 'Refaire calmement le pilier précipité + Sujud Sahw.',
    },
    linkedPostureId: 'sujud_2',
  },
  {
    id: 'rukn-11',
    index: 11,
    category: 'pillar',
    arabic: 'التشهد الأخير',
    transliteration: 'At-Tashahhud al-Akhir',
    title: { en: 'Final Tashahhud', fr: 'Le Tashahhud Final' },
    summary: {
      en: 'Reciting the At-Tahiyyat testimony in the final sitting.',
      fr: 'Réciter l’attestation (At-Tahiyyat) lors de l’assise finale.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière.',
    },
    ifMissedForgetfully: {
      en: 'Return to sit and recite it, then perform Sujud Sahw.',
      fr: 'Se rasseoir pour le réciter, puis effectuer le Sujud Sahw.',
    },
    linkedPostureId: 'tashahhud',
  },
  {
    id: 'rukn-12',
    index: 12,
    category: 'pillar',
    arabic: 'الجلوس للتشهد الأخير',
    transliteration: 'Al-Julus lit-Tashahhud',
    title: { en: 'Sitting for Final Tashahhud', fr: 'L’Assise pour le Tashahhud Final' },
    summary: {
      en: 'Remaining seated calmly while reciting the final testimony and salutations.',
      fr: 'Demeurer assis posément pendant le Tashahhud final et la prière sur le Prophète.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière.',
    },
    ifMissedForgetfully: {
      en: 'Return to sitting posture + Sujud Sahw.',
      fr: 'Revenir à l’assise finale + Sujud Sahw.',
    },
    linkedPostureId: 'tashahhud',
  },
  {
    id: 'rukn-13',
    index: 13,
    category: 'pillar',
    arabic: 'الصلاة على النبي ﷺ',
    transliteration: 'As-Salah ala an-Nabi',
    title: { en: 'Blessings upon the Prophet ﷺ', fr: 'Prière sur le Prophète ﷺ' },
    summary: {
      en: 'Reciting As-Salat al-Ibrahimiyyah in the final sitting.',
      fr: 'Réciter la prière abrahamique après le Tashahhud final.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer (per Hanbali/Shafi’i pillar view).',
      fr: 'Invalide la prière selon l’avis qui en fait un pilier.',
    },
    ifMissedForgetfully: {
      en: 'Recite before Taslim + Sujud Sahw.',
      fr: 'La réciter avant le Taslim + Sujud Sahw.',
    },
    linkedPostureId: 'tashahhud',
  },
  {
    id: 'rukn-14',
    index: 14,
    category: 'pillar',
    arabic: 'التسليمتان',
    transliteration: 'At-Taslim',
    title: { en: 'Concluding Salutations (Taslim)', fr: 'Les Salutations Finales (Taslim)' },
    summary: {
      en: 'Turning head right then left saying "Assalamu alaykum wa rahmatullah".',
      fr: 'Tourner la tête à droite puis à gauche en disant « Assalamu alaykum wa rahmatullah ».',
    },
    ifMissedDeliberately: {
      en: 'Prayer is not concluded until Taslim is performed.',
      fr: 'La prière n’est pas clôturée tant que le Taslim n’est pas prononcé.',
    },
    ifMissedForgetfully: {
      en: 'Say Taslim once remembered if interval is short; otherwise repeat.',
      fr: 'Prononcer le Taslim si rappelé rapidement ; sinon refaire la prière.',
    },
    linkedPostureId: 'taslim',
  },
];

export const WAJIBAT_OBLIGATIONS: readonly FiqhRuleItem[] = [
  {
    id: 'wajib-1',
    index: 1,
    category: 'obligation',
    arabic: 'تكبيرات الانتقال',
    transliteration: 'Takbirat al-Intiqal',
    title: { en: 'Transition Takbirs', fr: 'Takbirs de Transition' },
    summary: {
      en: 'Saying "Allahu Akbar" when moving between postures (except rising from Ruku).',
      fr: 'Dire « Allahu Akbar » lors des transitions (sauf en se relevant du Ruku).',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière s’il est délaissé volontairement.',
    },
    ifMissedForgetfully: {
      en: 'Prayer remains valid; compensated by Sujud al-Sahw.',
      fr: 'Prière valide ; compensé par le Sujud al-Sahw.',
    },
    linkedPostureId: 'ruku',
  },
  {
    id: 'wajib-2',
    index: 2,
    category: 'obligation',
    arabic: 'سمع الله لمن حمده',
    transliteration: 'Sami’Allahu liman hamidah',
    title: { en: 'Saying "Sami’Allahu liman hamidah"', fr: 'Dire « Sami’Allahu liman hamidah »' },
    summary: {
      en: 'Said by Imam and individual worshipper when rising from Ruku.',
      fr: 'Prononcé par l’imam et le prieur seul en se relevant de l’inclinaison.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière si omis volontairement.',
    },
    ifMissedForgetfully: {
      en: 'Compensated by Sujud al-Sahw.',
      fr: 'Compensé par le Sujud al-Sahw.',
    },
    linkedPostureId: 'itidal',
  },
  {
    id: 'wajib-3',
    index: 3,
    category: 'obligation',
    arabic: 'ربنا ولك الحمد',
    transliteration: 'Rabbana wa laka al-hamd',
    title: { en: 'Saying "Rabbana wa laka al-hamd"', fr: 'Dire « Rabbana wa laka al-hamd »' },
    summary: {
      en: 'Said by everyone upon standing upright after Ruku.',
      fr: 'Prononcé par tous une fois redressé après le Ruku.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière si omis volontairement.',
    },
    ifMissedForgetfully: {
      en: 'Compensated by Sujud al-Sahw.',
      fr: 'Compensé par le Sujud al-Sahw.',
    },
    linkedPostureId: 'itidal',
  },
  {
    id: 'wajib-4',
    index: 4,
    category: 'obligation',
    arabic: 'سبحان ربي العظيم',
    transliteration: 'Subhana Rabbi al-Azim',
    title: { en: 'Glorification in Ruku (Once Obligatory)', fr: 'Glorification dans le Ruku' },
    summary: {
      en: 'Saying "Subhana Rabbi al-Azim" once is Wajib; three times is Sunnah.',
      fr: 'Dire « Subhana Rabbi al-Azim » une fois est Wajib ; trois fois est Sunnah.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière si omis volontairement.',
    },
    ifMissedForgetfully: {
      en: 'Compensated by Sujud al-Sahw.',
      fr: 'Compensé par le Sujud al-Sahw.',
    },
    linkedPostureId: 'ruku',
  },
  {
    id: 'wajib-5',
    index: 5,
    category: 'obligation',
    arabic: 'سبحان ربي الأعلى',
    transliteration: 'Subhana Rabbi al-A’la',
    title: { en: 'Glorification in Sujud (Once Obligatory)', fr: 'Glorification dans le Sujud' },
    summary: {
      en: 'Saying "Subhana Rabbi al-A’la" once is Wajib; three times is Sunnah.',
      fr: 'Dire « Subhana Rabbi al-A’la » une fois est Wajib ; trois fois est Sunnah.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière si omis volontairement.',
    },
    ifMissedForgetfully: {
      en: 'Compensated by Sujud al-Sahw.',
      fr: 'Compensé par le Sujud al-Sahw.',
    },
    linkedPostureId: 'sujud_1',
  },
  {
    id: 'wajib-6',
    index: 6,
    category: 'obligation',
    arabic: 'رب اغفر لي',
    transliteration: 'Rabbighfir li',
    title: { en: 'Supplication Between Prostrations', fr: 'Invocation entre les Prosternations' },
    summary: {
      en: 'Saying "Rabbighfir li" (My Lord, forgive me) while seated in Jalsa.',
      fr: 'Dire « Rabbighfir li » (Seigneur, pardonne-moi) assis entre les deux Sujud.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière si omis volontairement.',
    },
    ifMissedForgetfully: {
      en: 'Compensated by Sujud al-Sahw.',
      fr: 'Compensé par le Sujud al-Sahw.',
    },
    linkedPostureId: 'jalsa',
  },
  {
    id: 'wajib-7',
    index: 7,
    category: 'obligation',
    arabic: 'التشهد الأول',
    transliteration: 'At-Tashahhud al-Awwal',
    title: { en: 'First Tashahhud (After 2nd Rak’ah)', fr: 'Premier Tashahhud (2e Rak’ah)' },
    summary: {
      en: 'Reciting At-Tahiyyat after the second Rak’ah in 3- or 4-Rak’ah prayers.',
      fr: 'Réciter le premier Tashahhud après la 2e Rak’ah dans les prières de 3 ou 4 unités.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière si omis volontairement.',
    },
    ifMissedForgetfully: {
      en: 'If already standing fully for 3rd Rak’ah, continue and perform Sujud al-Sahw.',
      fr: 'Si déjà relevé pour la 3e Rak’ah, poursuivre et faire le Sujud al-Sahw.',
    },
    linkedPostureId: 'tashahhud',
  },
  {
    id: 'wajib-8',
    index: 8,
    category: 'obligation',
    arabic: 'الجلوس للتشهد الأول',
    transliteration: 'Al-Julus lit-Tashahhud al-Awwal',
    title: { en: 'Sitting for First Tashahhud', fr: 'Assise pour le Premier Tashahhud' },
    summary: {
      en: 'Sitting upright in Iftirash after the 2nd Rak’ah in 3- or 4-Rak’ah prayers.',
      fr: 'S’asseoir en Iftirash après la 2e Rak’ah des prières à 3 ou 4 Rak’ahs.',
    },
    ifMissedDeliberately: {
      en: 'Invalidates the prayer.',
      fr: 'Invalide la prière si omis volontairement.',
    },
    ifMissedForgetfully: {
      en: 'Compensated by Sujud al-Sahw.',
      fr: 'Compensé par le Sujud al-Sahw.',
    },
    linkedPostureId: 'tashahhud',
  },
];

export const ALL_FIQH_RULES: readonly FiqhRuleItem[] = [
  ...SHURUT_CONDITIONS,
  ...ARKAN_PILLARS,
  ...WAJIBAT_OBLIGATIONS,
];

export const PRAYER_STEPS: readonly PrayerStep[] = [
  {
    id: 'qiyam_ready',
    order: 1,
    category: 'pillar',
    arabicName: 'القيام والنية',
    transliteration: 'Qiyam & Niyyah',
    title: {
      en: '01. Standing & Intention (Qiyam)',
      fr: '01. Station Debout & Intention (Qiyam)',
    },
    recitationArabic: 'نَوَيْتُ الصَّلَاةَ لِلَّهِ تَعَالَى',
    recitationTranslit: 'Silent intention in the heart (no verbal formula required)',
    recitationMeaning: {
      en: 'Resolve sincerely in the heart which prayer you are offering and face the Qiblah.',
      fr: 'Formulez dans le cœur l’intention sincère de la prière face à la Qiblah.',
    },
    speechCue: {
      mode: 'silent',
      instruction: {
        en: 'Silent in the heart (Condition)',
        fr: 'Silencieux dans le cœur (Condition)',
      },
    },
    postureSummary: {
      en: 'Stand upright with feet shoulder-width apart, toes pointing toward the Qiblah, gaze resting at the place of prostration.',
      fr: 'Tenez-vous droit, pieds écartés à largeur d’épaules vers la Qiblah, regard posé au point de prosternation.',
    },
    checkpoints: [
      { en: 'Spine erect and shoulders relaxed', fr: 'Colonne droite et épaules détendues' },
      { en: 'Feet parallel, pointing straight toward Qiblah', fr: 'Pieds parallèles orientés vers la Qiblah' },
      { en: 'Gaze lowered to the prostration spot on the mat', fr: 'Regard abaissé vers le point de prosternation' },
    ],
    alignmentNote: {
      en: '90° upright axis aligned with Qiblah vector',
      fr: 'Axe vertical à 90° aligné sur le vecteur Qiblah',
    },
    linkedRuleIds: ['shart-8', 'shart-9', 'rukn-1'],
  },
  {
    id: 'takbir_ihram',
    order: 2,
    category: 'pillar',
    arabicName: 'تكبيرة الإحرام',
    transliteration: 'Takbiratul Ihram',
    title: {
      en: '02. Opening Takbir (Ihram)',
      fr: '02. Takbir d’Ouverture (Ihram)',
    },
    recitationArabic: 'اللَّهُ أَكْبَرُ',
    recitationTranslit: 'Allahu Akbar',
    recitationMeaning: {
      en: 'God is the Greatest — entering the sacred state of prayer.',
      fr: 'Dieu est le Plus Grand — entrée solennelle dans l’état de prière.',
    },
    speechCue: {
      mode: 'spoken',
      instruction: {
        en: 'Say once to enter prayer (Pillar)',
        fr: 'Dire 1× pour entrer en prière (Pilier)',
      },
    },
    postureSummary: {
      en: 'Raise both hands smoothly up to earlobes or shoulder level, palms facing forward toward the Qiblah with fingers naturally extended.',
      fr: 'Levez les deux mains à hauteur des épaules ou des lobes d’oreilles, paumes tournées vers la Qiblah.',
    },
    checkpoints: [
      { en: 'Palms open and facing the Qiblah', fr: 'Paumes ouvertes face à la Qiblah' },
      { en: 'Fingers naturally aligned, neither clenched nor spread wide', fr: 'Doigts alignés naturellement sans tension' },
      { en: 'Pronounce "Allahu Akbar" audibly to yourself', fr: 'Prononcez « Allahu Akbar » distinctement' },
    ],
    alignmentNote: {
      en: 'Hands elevated symmetrically to ear/shoulder plane',
      fr: 'Mains élevées symétriquement au plan épaules/oreilles',
    },
    linkedRuleIds: ['rukn-2'],
  },
  {
    id: 'qiyam_qiraah',
    order: 3,
    category: 'pillar',
    arabicName: 'القيام والقراءة',
    transliteration: 'Qiyam & Al-Fatihah',
    title: {
      en: '03. Folding Hands & Reciting Al-Fatihah',
      fr: '03. Mains Posées & Récitation d’Al-Fatihah',
    },
    recitationArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    recitationTranslit: 'Bismillahir-Rahmanir-Rahim · Al-hamdu lillahi Rabbil-Alamin...',
    recitationMeaning: {
      en: 'Recite Surah Al-Fatihah (Pillar) followed by a short Surah in the first two Rak’ahs.',
      fr: 'Récitez Al-Fatihah (Pilier) suivie d’une courte sourate dans les deux premières Rak’ahs.',
    },
    speechCue: {
      mode: 'spoken',
      instruction: {
        en: 'Recite Al-Fatihah in every Rak’ah (Pillar)',
        fr: 'Réciter Al-Fatihah dans chaque Rak’ah (Pilier)',
      },
    },
    postureSummary: {
      en: 'Place the right hand over the back of the left hand/wrist upon the chest, standing still and focused.',
      fr: 'Posez la main droite sur le dos de la main ou du poignet gauche sur la poitrine avec recueillement.',
    },
    checkpoints: [
      { en: 'Right hand resting gently over left wrist/forearm', fr: 'Main droite posée sur le poignet gauche' },
      { en: 'Recite every verse of Al-Fatihah clearly', fr: 'Récitez chaque verset d’Al-Fatihah clairement' },
      { en: 'Maintain calm upright posture without swaying', fr: 'Maintenez une posture droite et calme' },
    ],
    alignmentNote: {
      en: 'Balanced vertical stance · Hands folded over sternum',
      fr: 'Posture verticale stable · Mains sur le sternum',
    },
    linkedRuleIds: ['rukn-1', 'rukn-3'],
  },
  {
    id: 'ruku',
    order: 4,
    category: 'pillar',
    arabicName: 'الركوع',
    transliteration: 'Ar-Ruku',
    title: {
      en: '04. Bowing (Ruku)',
      fr: '04. L’Inclinaison (Ruku)',
    },
    recitationArabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    recitationTranslit: 'Subhana Rabbi al-Azim (3×)',
    recitationMeaning: {
      en: 'Glory be to my Lord, the Supreme.',
      fr: 'Gloire à mon Seigneur, l’Immense.',
    },
    speechCue: {
      mode: 'spoken',
      instruction: {
        en: 'Say "Allahu Akbar" descending · Say Tasbih 3× (1× Wajib)',
        fr: 'Dire « Allahu Akbar » en descendant · Tasbih 3× (1× Wajib)',
      },
    },
    postureSummary: {
      en: 'Say "Allahu Akbar" and hinge at the hips until your back and head form a level horizontal line (90°), gripping knees firmly.',
      fr: 'Dites « Allahu Akbar » et inclinez le buste à 90° dos parfaitement plat, paumes saisissant les genoux.',
    },
    checkpoints: [
      { en: 'Back and neck level at 90° horizontal plane', fr: 'Dos et nuque alignés à l’horizontale (90°)' },
      { en: 'Hands firmly grasping the kneecaps, elbows slightly out', fr: 'Mains posées fermement sur les genoux' },
      { en: 'Legs straight; pause in full stillness (Tuma’ninah)', fr: 'Jambes tendues ; marquez un arrêt serein' },
    ],
    alignmentNote: {
      en: '90° hip flexion · Flat dorsal plane',
      fr: 'Flexion des hanches à 90° · Plan dorsal horizontal',
    },
    linkedRuleIds: ['rukn-4', 'rukn-10', 'wajib-1', 'wajib-4'],
  },
  {
    id: 'itidal',
    order: 5,
    category: 'pillar',
    arabicName: 'الاعتدال',
    transliteration: 'Al-I’tidal (Qawmah)',
    title: {
      en: '05. Rising Upright (I’tidal)',
      fr: '05. Le Relèvement Droit (I’tidal)',
    },
    recitationArabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ',
    recitationTranslit: 'Sami’Allahu liman hamidah · Rabbana wa laka al-hamd',
    recitationMeaning: {
      en: 'God hears the one who praises Him. Our Lord, to You belongs all praise.',
      fr: 'Dieu entend celui qui Le loue. Notre Seigneur, à Toi la louange.',
    },
    speechCue: {
      mode: 'spoken',
      instruction: {
        en: 'First phrase while rising · Second upright (Wajib)',
        fr: '1re phrase en montant · 2e une fois droit (Wajib)',
      },
    },
    postureSummary: {
      en: 'Rise smoothly from Ruku back to a fully upright standing posture with arms relaxed by your sides (or folded) and pause calmly.',
      fr: 'Redressez-vous complètement à la verticale, bras relâchés le long du corps, et marquez un arrêt posé.',
    },
    checkpoints: [
      { en: 'Return completely upright before descending', fr: 'Se redresser entièrement avant de descendre' },
      { en: 'Say Sami’Allahu liman hamidah while rising', fr: 'Prononcer Sami’Allahu liman hamidah en montant' },
      { en: 'Pause with full Tuma’ninah upright', fr: 'Marquer une pause de stabilité debout' },
    ],
    alignmentNote: {
      en: 'Full 180° spinal extension restored',
      fr: 'Extension complète de la colonne rétablie',
    },
    linkedRuleIds: ['rukn-5', 'rukn-6', 'rukn-10', 'wajib-2', 'wajib-3'],
  },
  {
    id: 'sujud_1',
    order: 6,
    category: 'pillar',
    arabicName: 'السجدة الأولى',
    transliteration: 'As-Sujud al-Awwal',
    title: {
      en: '06. First Prostration (Sujud)',
      fr: '06. Première Prosternation (Sujud)',
    },
    recitationArabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    recitationTranslit: 'Subhana Rabbi al-A’la (3×)',
    recitationMeaning: {
      en: 'Glory be to my Lord, the Most High.',
      fr: 'Gloire à mon Seigneur, le Très-Haut.',
    },
    speechCue: {
      mode: 'spoken',
      instruction: {
        en: 'Say "Allahu Akbar" descending · Say Tasbih 3× (1× Wajib)',
        fr: 'Dire « Allahu Akbar » en descendant · Tasbih 3× (1× Wajib)',
      },
    },
    postureSummary: {
      en: 'Say "Allahu Akbar" and descend into prostration on 7 points: forehead + nose, both palms, both knees, and the toes of both feet.',
      fr: 'Dites « Allahu Akbar » et prosternez-vous sur 7 appuis : front + nez, deux paumes, deux genoux et orteils.',
    },
    checkpoints: [
      { en: '7 bones grounded: forehead+nose, 2 palms, 2 knees, 2 toes', fr: '7 appuis au sol : front+nez, 2 paumes, 2 genoux, 2 pieds' },
      { en: 'Forearms lifted off the floor, elbows away from ribs', fr: 'Avant-bras décollés du sol, coudes dégagés' },
      { en: 'Fingers together pointing toward Qiblah beside shoulders/ears', fr: 'Doigts joints vers la Qiblah près des épaules' },
    ],
    alignmentNote: {
      en: '7-point floor contact · Forearms elevated',
      fr: '7 points de contact au sol · Avant-bras soulevés',
    },
    linkedRuleIds: ['rukn-7', 'rukn-10', 'wajib-1', 'wajib-5'],
  },
  {
    id: 'jalsa',
    order: 7,
    category: 'pillar',
    arabicName: 'الجلوس بين السجدتين',
    transliteration: 'Al-Jalsa (Iftirash)',
    title: {
      en: '07. Sitting Between Prostrations',
      fr: '07. Assise entre les deux Prosternations',
    },
    recitationArabic: 'رَبِّ اغْفِرْ لِي رَبِّ اغْفِرْ لِي',
    recitationTranslit: 'Rabbighfir li, Rabbighfir li',
    recitationMeaning: {
      en: 'My Lord, forgive me; my Lord, forgive me.',
      fr: 'Seigneur, pardonne-moi ; Seigneur, pardonne-moi.',
    },
    speechCue: {
      mode: 'spoken',
      instruction: {
        en: 'Say "Allahu Akbar" rising · Say 2× while seated (1× Wajib)',
        fr: 'Dire « Allahu Akbar » en montant · Dire 2× assis (1× Wajib)',
      },
    },
    postureSummary: {
      en: 'Rise with "Allahu Akbar" and sit calmly on your left foot (laid flat) while keeping the right foot upright on its toes, hands resting on thighs.',
      fr: 'Relevez-vous avec « Allahu Akbar », asseyez-vous sur le pied gauche allongé, pied droit dressé, mains sur les cuisses.',
    },
    checkpoints: [
      { en: 'Sit upright in Iftirash with back straight', fr: 'Dos droit et posé en position Iftirash' },
      { en: 'Hands resting flat on upper thighs near the knees', fr: 'Mains posées sur les cuisses près des genoux' },
      { en: 'Pause with full stillness before second Sujud', fr: 'Marquez un arrêt calme avant le 2e Sujud' },
    ],
    alignmentNote: {
      en: 'Iftirash seated equilibrium · Upright torso',
      fr: 'Équilibre assis Iftirash · Buste droit',
    },
    linkedRuleIds: ['rukn-8', 'rukn-9', 'rukn-10', 'wajib-1', 'wajib-6'],
  },
  {
    id: 'sujud_2',
    order: 8,
    category: 'pillar',
    arabicName: 'السجدة الثانية',
    transliteration: 'As-Sujud ath-Thani',
    title: {
      en: '08. Second Prostration (Sujud)',
      fr: '08. Seconde Prosternation (Sujud)',
    },
    recitationArabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    recitationTranslit: 'Subhana Rabbi al-A’la (3×)',
    recitationMeaning: {
      en: 'Glory be to my Lord, the Most High — completing the Rak’ah cycle.',
      fr: 'Gloire à mon Seigneur, le Très-Haut — clôture de l’unité (Rak’ah).',
    },
    speechCue: {
      mode: 'spoken',
      instruction: {
        en: 'Say "Allahu Akbar" descending · Say Tasbih 3× (1× Wajib)',
        fr: 'Dire « Allahu Akbar » en descendant · Tasbih 3× (1× Wajib)',
      },
    },
    postureSummary: {
      en: 'Prostrate a second time identically to the first on all 7 bones with calm reflection and stillness.',
      fr: 'Prosternez-vous une seconde fois de la même manière sur les 7 membres avec sérénité.',
    },
    checkpoints: [
      { en: 'Maintain all 7 grounded points firmly', fr: 'Maintenir les 7 points d’appui au sol' },
      { en: 'Keep forearms lifted off the prayer mat', fr: 'Garder les avant-bras décollés du tapis' },
      { en: 'Pause calmly before standing for next Rak’ah or sitting', fr: 'Pause sereine avant de se relever ou s’asseoir' },
    ],
    alignmentNote: {
      en: '7-point floor contact · Completes single Rak’ah',
      fr: '7 points d’appui · Achève la Rak’ah',
    },
    linkedRuleIds: ['rukn-7', 'rukn-10', 'wajib-1', 'wajib-5'],
  },
  {
    id: 'tashahhud',
    order: 9,
    category: 'pillar',
    arabicName: 'التشهد',
    transliteration: 'At-Tashahhud',
    title: {
      en: '09. Sitting for Testimony (Tashahhud)',
      fr: '09. Assise du Témoignage (Tashahhud)',
    },
    recitationArabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ',
    recitationTranslit: 'At-tahiyyatu lillahi was-salawatu wat-tayyibat...',
    recitationMeaning: {
      en: 'All greetings, prayers, and pure words belong to God. Recite Tashahhud (and Salawat in the final sitting).',
      fr: 'Toutes les salutations, prières et bonnes œuvres appartiennent à Dieu. Récitez le Tashahhud et les salutations.',
    },
    speechCue: {
      mode: 'spoken',
      instruction: {
        en: 'Recite softly while seated (Wajib / Pillar)',
        fr: 'Réciter doucement assis (Wajib / Pilier)',
      },
    },
    postureSummary: {
      en: 'Sit upright with left hand flat on left thigh and right hand on right thigh, gently pointing the right index finger toward the Qiblah.',
      fr: 'Assis droit, main gauche à plat sur la cuisse gauche, index droit légèrement pointé vers la Qiblah.',
    },
    checkpoints: [
      { en: 'Left hand open flat on left knee/thigh', fr: 'Main gauche à plat sur la cuisse gauche' },
      { en: 'Right index finger gently pointed during testimony', fr: 'Index droit levé doucement durant l’attestation' },
      { en: 'Gaze directed toward the right index finger', fr: 'Regard dirigé vers l’index droit' },
    ],
    alignmentNote: {
      en: 'Seated testimony posture · Index alignment',
      fr: 'Posture assise d’attestation · Alignement de l’index',
    },
    linkedRuleIds: ['rukn-11', 'rukn-12', 'rukn-13', 'wajib-7', 'wajib-8'],
  },
  {
    id: 'taslim',
    order: 10,
    category: 'pillar',
    arabicName: 'التسليم',
    transliteration: 'At-Taslim',
    title: {
      en: '10. Concluding Salutations (Taslim)',
      fr: '10. Salutations Finales (Taslim)',
    },
    recitationArabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
    recitationTranslit: 'Assalamu alaykum wa rahmatullah (Right, then Left)',
    recitationMeaning: {
      en: 'Peace and mercy of God be upon you — concluding the prayer with peace.',
      fr: 'Que la paix et la miséricorde de Dieu soient sur vous — clôture de la prière.',
    },
    speechCue: {
      mode: 'spoken',
      instruction: {
        en: 'Say turning right, then repeat turning left (Pillar)',
        fr: 'Dire en tournant à droite, puis à gauche (Pilier)',
      },
    },
    postureSummary: {
      en: 'While seated upright, turn your head smoothly to the right saying the Taslim, then turn smoothly to the left repeating it.',
      fr: 'Tout en restant assis droit, tournez doucement la tête à droite puis à gauche en prononçant le Taslim.',
    },
    checkpoints: [
      { en: 'Turn head right until cheek is visible from behind', fr: 'Tourner la tête à droite avec amplitude' },
      { en: 'Turn head left smoothly for the second Taslim', fr: 'Tourner doucement la tête à gauche ensuite' },
      { en: 'Keep shoulders steady while turning only the neck', fr: 'Garder les épaules stables durant la rotation' },
    ],
    alignmentNote: {
      en: 'Cervical rotation ±65° · Concludes Salah',
      fr: 'Rotation cervicale ±65° · Clôture de la prière',
    },
    linkedRuleIds: ['rukn-14'],
  },
];
