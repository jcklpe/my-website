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
    () => 24,
  );
  const accentRuleTexture = useState<HomeAccentRuleTexture>(
    'home-motion-debug-accent-rule-texture',
    () => 'vector-flag',
  );
  const accentRuleSpeed = useState(
    'home-motion-debug-accent-rule-speed',
    () => 2.65,
  );
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
  const lavaThickness = useState('home-motion-debug-lava-thickness', () => 1);
  const lavaLength = useState('home-motion-debug-lava-length', () => 1);
  const lavaDispersion = useState('home-motion-debug-lava-dispersion', () => 1);
  const lavaParticleReach = useState(
    'home-motion-debug-lava-particle-reach',
    () => 1,
  );
  const enableBentoPointerField = useState(
    'home-motion-debug-bento-pointer-field',
    () => true,
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
  const enableCaseStudyAmbientCurrent = useState(
    'home-motion-debug-case-study-ambient-current',
    () => true,
  );
  const enableCaseStudyOrdinalStar = useState(
    'home-motion-debug-case-study-ordinal-star',
    () => false,
  );
  const enableCaseStudyEdgeRunner = useState(
    'home-motion-debug-case-study-edge-runner',
    () => false,
  );
  const enableCaseStudyCatalogPeek = useState(
    'home-motion-debug-case-study-catalog-peek',
    () => false,
  );
  const enableCaseStudyPlateSignal = useState(
    'home-motion-debug-case-study-plate-signal',
    () => false,
  );
  const enableLatestWritingCrosshairRotation = useState(
    'home-motion-debug-latest-writing-crosshair-rotation',
    () => true,
  );
  const enableFooterQuietSignal = useState(
    'home-motion-debug-footer-quiet-signal',
    () => true,
  );
  const enableFooterTicker = useState(
    'home-motion-debug-footer-ticker',
    () => true,
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
    enableCaseStudyOrdinalStar,
    enableCaseStudyEdgeRunner,
    enableCaseStudyCatalogPeek,
    enableCaseStudyPlateSignal,
    enableLatestWritingCrosshairRotation,
    enableFooterQuietSignal,
    enableFooterTicker,
    enableConstructionBanner,
    controlsMinimized,
  };
}
