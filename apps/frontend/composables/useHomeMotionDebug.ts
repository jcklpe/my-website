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
    controlsMinimized,
  };
}
