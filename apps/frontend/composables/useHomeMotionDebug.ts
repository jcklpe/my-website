export type HomeAccentRuleTexture =
  | 'vector-flag'
  | 'webgl-lava-shedding'
  | 'hybrid-flag-shedding';

export type HomeCaseStudyOrdinalMotion = 'none' | 'star' | 'wave' | 'brackets';

export function useHomeMotionDebug() {
  const animateAccentRule = useState(
    'home-motion-debug-accent-rule',
    () => true,
  );
  const accentRuleStrength = useState(
    'home-motion-debug-accent-rule-strength',
    () => 24,
  );
  const accentRuleTexture = useState<HomeAccentRuleTexture>(
    'home-motion-debug-accent-rule-texture',
    () => 'vector-flag',
  );
  const vectorAccentRuleSpeed = useState(
    'home-motion-debug-vector-accent-rule-speed',
    () => 2.65,
  );
  const lavaAccentRuleSpeed = useState(
    'home-motion-debug-lava-accent-rule-speed',
    () => 4.25,
  );
  const accentRuleSpeed = computed({
    get: () =>
      accentRuleTexture.value === 'webgl-lava-shedding'
        ? lavaAccentRuleSpeed.value
        : vectorAccentRuleSpeed.value,
    set: (value: number) => {
      if (accentRuleTexture.value === 'webgl-lava-shedding') {
        lavaAccentRuleSpeed.value = value;
      } else {
        vectorAccentRuleSpeed.value = value;
      }
    },
  });
  const accentWaveAmplitude = useState(
    'home-motion-debug-accent-wave-amplitude',
    () => 8,
  );
  const accentWaveFrequency = useState(
    'home-motion-debug-accent-wave-frequency',
    () => 1.7,
  );
  const accentRuleThickness = useState(
    'home-motion-debug-accent-rule-thickness',
    () => 4.6,
  );
  const accentRuleOffsetX = useState(
    'home-motion-debug-accent-rule-offset-x',
    () => 234,
  );
  const accentRuleOffsetY = useState(
    'home-motion-debug-accent-rule-offset-y',
    () => -23,
  );
  const accentRuleBoxWidth = useState(
    'home-motion-debug-accent-rule-box-width',
    () => 474,
  );
  const accentRuleBoxHeight = useState(
    'home-motion-debug-accent-rule-box-height',
    () => 8,
  );
  const accentRuleCompactDesktopOffsetX = useState(
    'home-motion-debug-accent-rule-compact-desktop-offset-x',
    () => 100,
  );
  const accentRuleCompactDesktopOffsetY = useState(
    'home-motion-debug-accent-rule-compact-desktop-offset-y',
    () => -23,
  );
  const accentRuleCompactDesktopBoxWidth = useState(
    'home-motion-debug-accent-rule-compact-desktop-box-width',
    () => 474,
  );
  const accentRuleCompactDesktopBoxHeight = useState(
    'home-motion-debug-accent-rule-compact-desktop-box-height',
    () => 8,
  );
  const accentRuleCompactDesktopWaveAmplitude = useState(
    'home-motion-debug-accent-rule-compact-desktop-wave-amplitude',
    () => 8,
  );
  const accentRuleTabletOffsetX = useState(
    'home-motion-debug-accent-rule-tablet-offset-x',
    () => 71,
  );
  const accentRuleTabletOffsetY = useState(
    'home-motion-debug-accent-rule-tablet-offset-y',
    () => -11,
  );
  const accentRuleTabletBoxWidth = useState(
    'home-motion-debug-accent-rule-tablet-box-width',
    () => 206,
  );
  const accentRuleTabletBoxHeight = useState(
    'home-motion-debug-accent-rule-tablet-box-height',
    () => 8,
  );
  const accentRuleTabletWaveAmplitude = useState(
    'home-motion-debug-accent-rule-tablet-wave-amplitude',
    () => 4.7,
  );
  const accentRulePhoneOffsetX = useState(
    'home-motion-debug-accent-rule-phone-offset-x',
    () => -2,
  );
  const accentRulePhoneOffsetY = useState(
    'home-motion-debug-accent-rule-phone-offset-y',
    () => -23,
  );
  const accentRulePhoneBoxWidth = useState(
    'home-motion-debug-accent-rule-phone-box-width',
    () => 250,
  );
  const accentRulePhoneBoxHeight = useState(
    'home-motion-debug-accent-rule-phone-box-height',
    () => 8,
  );
  const accentRulePhoneWaveAmplitude = useState(
    'home-motion-debug-accent-rule-phone-wave-amplitude',
    () => 5.6,
  );
  const lavaThickness = useState('home-motion-debug-lava-thickness', () => 1);
  const lavaLength = useState('home-motion-debug-lava-length', () => 0.85);
  const lavaDispersion = useState(
    'home-motion-debug-lava-dispersion',
    () => 1.6,
  );
  const lavaParticleReach = useState(
    'home-motion-debug-lava-particle-reach',
    () => 1,
  );
  const lavaRuleOffsetX = useState(
    'home-motion-debug-lava-rule-offset-x',
    () => 279,
  );
  const lavaRuleOffsetY = useState(
    'home-motion-debug-lava-rule-offset-y',
    () => 0,
  );
  const lavaRuleBoxWidth = useState(
    'home-motion-debug-lava-rule-box-width',
    () => 506,
  );
  const lavaRuleBoxHeight = useState(
    'home-motion-debug-lava-rule-box-height',
    () => 32,
  );
  const hybridShedDensity = useState(
    'home-motion-debug-hybrid-shed-density',
    () => 0.9,
  );
  const hybridShedForce = useState(
    'home-motion-debug-hybrid-shed-force',
    () => 1.35,
  );
  const bentoPointerStrength = useState(
    'home-motion-debug-bento-pointer-strength',
    () => 1,
  );
  const enableTestimonialTextureParallax = useState(
    'home-motion-debug-testimonial-texture-parallax',
    () => true,
  );
  const testimonialTextureParallaxStrength = useState(
    'home-motion-debug-testimonial-texture-parallax-strength',
    () => 4,
  );
  const useQuoteSignal = useState(
    'home-motion-debug-testimonial-quote-signal',
    () => true,
  );
  const caseStudyOrdinalMotion = useState<HomeCaseStudyOrdinalMotion>(
    'home-motion-debug-case-study-ordinal-motion',
    () => 'none',
  );
  const enableConstructionBanner = useState(
    'home-motion-debug-construction-banner',
    () => true,
  );
  const controlsMinimized = useState(
    'home-motion-debug-controls-minimized',
    () => true,
  );

  return {
    animateAccentRule,
    accentRuleStrength,
    accentRuleTexture,
    accentRuleSpeed,
    accentWaveAmplitude,
    accentWaveFrequency,
    accentRuleThickness,
    accentRuleOffsetX,
    accentRuleOffsetY,
    accentRuleBoxWidth,
    accentRuleBoxHeight,
    accentRuleCompactDesktopOffsetX,
    accentRuleCompactDesktopOffsetY,
    accentRuleCompactDesktopBoxWidth,
    accentRuleCompactDesktopBoxHeight,
    accentRuleCompactDesktopWaveAmplitude,
    accentRuleTabletOffsetX,
    accentRuleTabletOffsetY,
    accentRuleTabletBoxWidth,
    accentRuleTabletBoxHeight,
    accentRuleTabletWaveAmplitude,
    accentRulePhoneOffsetX,
    accentRulePhoneOffsetY,
    accentRulePhoneBoxWidth,
    accentRulePhoneBoxHeight,
    accentRulePhoneWaveAmplitude,
    lavaThickness,
    lavaLength,
    lavaDispersion,
    lavaParticleReach,
    lavaRuleOffsetX,
    lavaRuleOffsetY,
    lavaRuleBoxWidth,
    lavaRuleBoxHeight,
    hybridShedDensity,
    hybridShedForce,
    bentoPointerStrength,
    enableTestimonialTextureParallax,
    testimonialTextureParallaxStrength,
    useQuoteSignal,
    caseStudyOrdinalMotion,
    enableConstructionBanner,
    controlsMinimized,
  };
}
