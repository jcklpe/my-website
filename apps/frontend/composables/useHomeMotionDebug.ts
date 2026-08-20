export type HomeAccentRuleTexture =
  | 'vector-fluid'
  | 'vector-flag'
  | 'vector-signal'
  | 'webgl-flow'
  | 'webgl-lava'
  | 'webgl-lava-shedding'
  | 'webgl-domain-warp';

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
  const accentRuleLength = useState(
    'home-motion-debug-accent-rule-length',
    () => 1,
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
    accentRuleLength,
    lavaThickness,
    lavaLength,
    lavaDispersion,
    lavaParticleReach,
    enableBentoPointerField,
    bentoPointerStrength,
    enableTestimonialTextureParallax,
    testimonialTextureParallaxStrength,
    useQuoteSignal,
    controlsMinimized,
  };
}
