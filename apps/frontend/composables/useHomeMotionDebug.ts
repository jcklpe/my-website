export type HomeAccentRuleTexture =
  | 'vector-fluid'
  | 'vector-flag'
  | 'vector-signal'
  | 'webgl-flow'
  | 'webgl-lava'
  | 'webgl-lava-shedding';

export function useHomeMotionDebug() {
  const animateAccentRule = useState(
    'home-motion-debug-accent-rule',
    () => true,
  );
  const accentRuleStrength = useState(
    'home-motion-debug-accent-rule-strength',
    () => 0.72,
  );
  const accentRuleTexture = useState<HomeAccentRuleTexture>(
    'home-motion-debug-accent-rule-texture',
    () => 'vector-fluid',
  );
  const accentRuleSpeed = useState(
    'home-motion-debug-accent-rule-speed',
    () => 0.7,
  );
  const accentWaveAmplitude = useState(
    'home-motion-debug-accent-wave-amplitude',
    () => 1,
  );
  const accentWaveFrequency = useState(
    'home-motion-debug-accent-wave-frequency',
    () => 1,
  );
  const accentRuleThickness = useState(
    'home-motion-debug-accent-rule-thickness',
    () => 1,
  );
  const accentRuleOffsetX = useState(
    'home-motion-debug-accent-rule-offset-x',
    () => 0,
  );
  const accentRuleOffsetY = useState(
    'home-motion-debug-accent-rule-offset-y',
    () => 0,
  );
  const accentRuleBoxWidth = useState(
    'home-motion-debug-accent-rule-box-width',
    () => 88,
  );
  const accentRuleBoxHeight = useState(
    'home-motion-debug-accent-rule-box-height',
    () => 12,
  );
  const lavaThickness = useState('home-motion-debug-lava-thickness', () => 1);
  const lavaLength = useState('home-motion-debug-lava-length', () => 1);
  const lavaDispersion = useState('home-motion-debug-lava-dispersion', () => 1);
  const lavaParticleReach = useState(
    'home-motion-debug-lava-particle-reach',
    () => 1,
  );
  const enableBentoPointerField = useState(
    'home-motion-debug-bento-pointer-field',
    () => false,
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
    () => 1,
  );
  const useQuoteSignal = useState(
    'home-motion-debug-testimonial-quote-signal',
    () => false,
  );
  const enableCaseStudyAmbientCurrent = useState(
    'home-motion-debug-case-study-ambient-current',
    () => false,
  );
  const enableLatestWritingCrosshairRotation = useState(
    'home-motion-debug-latest-writing-crosshair-rotation',
    () => false,
  );
  const enableFooterQuietSignal = useState(
    'home-motion-debug-footer-quiet-signal',
    () => false,
  );
  const enableFooterTicker = useState(
    'home-motion-debug-footer-ticker',
    () => false,
  );
  const controlsMinimized = useState(
    'home-motion-debug-controls-minimized',
    () => false,
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
    lavaThickness,
    lavaLength,
    lavaDispersion,
    lavaParticleReach,
    enableBentoPointerField,
    bentoPointerStrength,
    enableTestimonialTextureParallax,
    testimonialTextureParallaxStrength,
    useQuoteSignal,
    enableCaseStudyAmbientCurrent,
    enableLatestWritingCrosshairRotation,
    enableFooterQuietSignal,
    enableFooterTicker,
    controlsMinimized,
  };
}
