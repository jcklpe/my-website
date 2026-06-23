import type { WordPressCaseStudy } from '~/types/wordpress';

export type CaseStudyDuotoneMode = 'off' | 'direct' | 'crisp' | 'bleed';
export type CaseStudyTonePair =
  | 'ink-cream'
  | 'blue-cream'
  | 'ink-blue'
  | 'tritone-ink-blue-cream'
  | 'tritone-ink-soft-cream';
export type CaseStudyBleedDirection =
  | 'to top'
  | 'to bottom'
  | 'to left'
  | 'to right';

export type CaseStudyPhotoTreatmentConfig = {
  duotoneMode: CaseStudyDuotoneMode;
  tonePair: CaseStudyTonePair;
  halftoneSize: number;
  bleedDirection: CaseStudyBleedDirection;
  bleedStrength: number;
  bleedOpacity: number;
  bleedBlend: string;
  tintOverlayEnabled: boolean;
  tintOpacity: number;
};

export const CASE_STUDY_TINT_ANGLE = 189;

// Values match the ACF selected_work_photo_treatment choices.
export const CASE_STUDY_PHOTO_TREATMENT_PRESETS: Record<
  string,
  CaseStudyPhotoTreatmentConfig
> = {
  bleed_blue_cream: {
    duotoneMode: 'bleed',
    tonePair: 'blue-cream',
    halftoneSize: 11,
    bleedDirection: 'to top',
    bleedStrength: 80,
    bleedOpacity: 1,
    bleedBlend: 'color',
    tintOverlayEnabled: true,
    tintOpacity: 0.7,
  },
  direct_ink_blue: {
    duotoneMode: 'direct',
    tonePair: 'ink-blue',
    halftoneSize: 11,
    bleedDirection: 'to top',
    bleedStrength: 100,
    bleedOpacity: 0.5,
    bleedBlend: 'overlay',
    tintOverlayEnabled: true,
    tintOpacity: 0.7,
  },
  direct_tritone: {
    duotoneMode: 'direct',
    tonePair: 'tritone-ink-blue-cream',
    halftoneSize: 11,
    bleedDirection: 'to top',
    bleedStrength: 100,
    bleedOpacity: 0.5,
    bleedBlend: 'overlay',
    tintOverlayEnabled: true,
    tintOpacity: 0.7,
  },
  direct_blue_cream: {
    duotoneMode: 'direct',
    tonePair: 'blue-cream',
    halftoneSize: 11,
    bleedDirection: 'to top',
    bleedStrength: 100,
    bleedOpacity: 0.5,
    bleedBlend: 'overlay',
    tintOverlayEnabled: true,
    tintOpacity: 0.5,
  },
  crisp_ink_blue: {
    duotoneMode: 'crisp',
    tonePair: 'ink-blue',
    halftoneSize: 11,
    bleedDirection: 'to top',
    bleedStrength: 100,
    bleedOpacity: 0.5,
    bleedBlend: 'overlay',
    tintOverlayEnabled: true,
    tintOpacity: 0.65,
  },
  bleed_tritone: {
    duotoneMode: 'bleed',
    tonePair: 'tritone-ink-blue-cream',
    halftoneSize: 11,
    bleedDirection: 'to top',
    bleedStrength: 80,
    bleedOpacity: 1,
    bleedBlend: 'color',
    tintOverlayEnabled: true,
    tintOpacity: 0.7,
  },
};

export const CASE_STUDY_PHOTO_TREATMENT_CYCLE = [
  'bleed_blue_cream',
  'direct_ink_blue',
  'direct_tritone',
  'direct_blue_cream',
  'crisp_ink_blue',
  'bleed_tritone',
];

export function caseStudyPhotoTreatmentConfig(
  caseStudy: WordPressCaseStudy | null | undefined,
  index = 0,
) {
  const choice = caseStudy?.selectedWorkPhotoTreatment;

  if (
    choice &&
    choice !== 'auto' &&
    CASE_STUDY_PHOTO_TREATMENT_PRESETS[choice]
  ) {
    return CASE_STUDY_PHOTO_TREATMENT_PRESETS[choice]!;
  }

  const cycleKey =
    CASE_STUDY_PHOTO_TREATMENT_CYCLE[
      index % CASE_STUDY_PHOTO_TREATMENT_CYCLE.length
    ]!;

  return CASE_STUDY_PHOTO_TREATMENT_PRESETS[cycleKey]!;
}

export function caseStudyPhotoTreatmentClasses(
  config: CaseStudyPhotoTreatmentConfig,
) {
  return {
    'is-halftone-duotone-direct': config.duotoneMode === 'direct',
    'is-halftone-duotone-crisp': config.duotoneMode === 'crisp',
    'is-halftone-duotone-bleed': config.duotoneMode === 'bleed',
    [`is-halftone-tone-${config.tonePair}`]: true,
  };
}

export function caseStudyPhotoTreatmentStyle(
  config: CaseStudyPhotoTreatmentConfig,
): Record<string, string> {
  return {
    '--halftone-size-rest': `${config.halftoneSize}px`,
    '--halftone-bleed-direction': config.bleedDirection,
    '--halftone-bleed-strength': `${config.bleedStrength}%`,
    '--halftone-bleed-opacity': String(config.bleedOpacity),
    '--halftone-bleed-blend': config.bleedBlend,
    '--halftone-tint-opacity': String(config.tintOpacity),
    '--halftone-tint-angle': `${CASE_STUDY_TINT_ANGLE}deg`,
  };
}
