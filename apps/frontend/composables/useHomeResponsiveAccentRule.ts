type AccentRuleViewport = 'desktop' | 'tablet' | 'phone';

export function useHomeResponsiveAccentRule() {
  const settings = useHomeMotionDebug();
  const viewport = useState<AccentRuleViewport>(
    'home-motion-accent-rule-viewport',
    () => 'desktop',
  );

  function updateViewport() {
    viewport.value =
      window.innerWidth < 768
        ? 'phone'
        : window.innerWidth < 1200
          ? 'tablet'
          : 'desktop';
  }

  onMounted(() => {
    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewport);
  });

  const offsetX = computed({
    get: () => {
      if (viewport.value === 'phone') {
        return settings.accentRulePhoneOffsetX.value;
      }
      if (viewport.value === 'tablet') {
        return settings.accentRuleTabletOffsetX.value;
      }
      return settings.accentRuleOffsetX.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneOffsetX.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletOffsetX.value = value;
      } else {
        settings.accentRuleOffsetX.value = value;
      }
    },
  });
  const offsetY = computed({
    get: () => {
      if (viewport.value === 'phone') {
        return settings.accentRulePhoneOffsetY.value;
      }
      if (viewport.value === 'tablet') {
        return settings.accentRuleTabletOffsetY.value;
      }
      return settings.accentRuleOffsetY.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneOffsetY.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletOffsetY.value = value;
      } else {
        settings.accentRuleOffsetY.value = value;
      }
    },
  });
  const boxWidth = computed({
    get: () => {
      if (viewport.value === 'phone') {
        return settings.accentRulePhoneBoxWidth.value;
      }
      if (viewport.value === 'tablet') {
        return settings.accentRuleTabletBoxWidth.value;
      }
      return settings.accentRuleBoxWidth.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneBoxWidth.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletBoxWidth.value = value;
      } else {
        settings.accentRuleBoxWidth.value = value;
      }
    },
  });
  const boxHeight = computed({
    get: () => {
      if (viewport.value === 'phone') {
        return settings.accentRulePhoneBoxHeight.value;
      }
      if (viewport.value === 'tablet') {
        return settings.accentRuleTabletBoxHeight.value;
      }
      return settings.accentRuleBoxHeight.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneBoxHeight.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletBoxHeight.value = value;
      } else {
        settings.accentRuleBoxHeight.value = value;
      }
    },
  });
  const waveAmplitude = computed({
    get: () => {
      if (viewport.value === 'phone') {
        return settings.accentRulePhoneWaveAmplitude.value;
      }
      if (viewport.value === 'tablet') {
        return settings.accentRuleTabletWaveAmplitude.value;
      }
      return settings.accentWaveAmplitude.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneWaveAmplitude.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletWaveAmplitude.value = value;
      } else {
        settings.accentWaveAmplitude.value = value;
      }
    },
  });

  return {
    viewport,
    offsetX,
    offsetY,
    boxWidth,
    boxHeight,
    waveAmplitude,
  };
}
