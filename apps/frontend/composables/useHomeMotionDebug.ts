export function useHomeMotionDebug() {
  const enableTransitionTrails = useState(
    'motion-qa-transition-trails',
    () => false,
  );
  const animateAccentRule = useState(
    'home-motion-debug-accent-rule',
    () => true,
  );
  const accentRuleStrength = useState(
    'home-motion-debug-accent-rule-strength',
    () => 24,
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
  const accentRuleNarrowDesktopOffsetX = useState(
    'home-motion-debug-accent-rule-narrow-desktop-offset-x',
    () => 57,
  );
  const accentRuleNarrowDesktopOffsetY = useState(
    'home-motion-debug-accent-rule-narrow-desktop-offset-y',
    () => -22,
  );
  const accentRuleNarrowDesktopBoxWidth = useState(
    'home-motion-debug-accent-rule-narrow-desktop-box-width',
    () => 362,
  );
  const accentRuleNarrowDesktopBoxHeight = useState(
    'home-motion-debug-accent-rule-narrow-desktop-box-height',
    () => 8,
  );
  const accentRuleNarrowDesktopWaveAmplitude = useState(
    'home-motion-debug-accent-rule-narrow-desktop-wave-amplitude',
    () => 6.8,
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
  const enableConstructionBanner = useState(
    'home-motion-debug-construction-banner',
    () => true,
  );
  const controlsMinimized = useState(
    'home-motion-debug-controls-minimized',
    () => true,
  );

  return {
    enableTransitionTrails,
    animateAccentRule,
    accentRuleStrength,
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
    accentRuleNarrowDesktopOffsetX,
    accentRuleNarrowDesktopOffsetY,
    accentRuleNarrowDesktopBoxWidth,
    accentRuleNarrowDesktopBoxHeight,
    accentRuleNarrowDesktopWaveAmplitude,
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
    bentoPointerStrength,
    enableTestimonialTextureParallax,
    testimonialTextureParallaxStrength,
    useQuoteSignal,
    enableConstructionBanner,
    controlsMinimized,
  };
}
