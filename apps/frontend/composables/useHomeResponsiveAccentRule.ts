type AccentRuleViewport = 'desktop' | 'compact-desktop' | 'tablet' | 'phone';

type AccentRuleGeometry = {
  offsetX: number;
  offsetY: number;
  boxWidth: number;
  boxHeight: number;
};

export function useHomeResponsiveAccentRule() {
  const settings = useHomeMotionDebug();
  const viewport = useState<AccentRuleViewport>(
    'home-motion-accent-rule-viewport',
    () => 'desktop',
  );
  const responsiveLavaGeometry = useState<
    Record<Exclude<AccentRuleViewport, 'desktop'>, AccentRuleGeometry>
  >('home-motion-responsive-lava-geometry', () => ({
    'compact-desktop': {
      offsetX: 100,
      offsetY: 0,
      boxWidth: 474,
      boxHeight: 32,
    },
    tablet: {
      offsetX: 71,
      offsetY: 0,
      boxWidth: 206,
      boxHeight: 32,
    },
    phone: {
      offsetX: -2,
      offsetY: 0,
      boxWidth: 250,
      boxHeight: 32,
    },
  }));

  const usesStandaloneLava = computed(
    () => settings.accentRuleTexture.value === 'webgl-lava-shedding',
  );

  function updateViewport() {
    viewport.value =
      window.innerWidth < 768
        ? 'phone'
        : window.innerWidth < 1200
          ? 'tablet'
          : window.innerWidth < 1892
            ? 'compact-desktop'
            : 'desktop';
  }

  function responsiveLavaValue<Key extends keyof AccentRuleGeometry>(
    key: Key,
  ): AccentRuleGeometry[Key] {
    if (viewport.value === 'desktop') {
      if (key === 'offsetX') return settings.lavaRuleOffsetX.value;
      if (key === 'offsetY') return settings.lavaRuleOffsetY.value;
      if (key === 'boxWidth') return settings.lavaRuleBoxWidth.value;
      return settings.lavaRuleBoxHeight.value;
    }

    return responsiveLavaGeometry.value[viewport.value][key];
  }

  function setResponsiveLavaValue<Key extends keyof AccentRuleGeometry>(
    key: Key,
    value: AccentRuleGeometry[Key],
  ) {
    if (viewport.value === 'desktop') {
      if (key === 'offsetX') settings.lavaRuleOffsetX.value = value;
      else if (key === 'offsetY') settings.lavaRuleOffsetY.value = value;
      else if (key === 'boxWidth') settings.lavaRuleBoxWidth.value = value;
      else settings.lavaRuleBoxHeight.value = value;
      return;
    }

    responsiveLavaGeometry.value[viewport.value][key] = value;
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
      if (usesStandaloneLava.value) return responsiveLavaValue('offsetX');
      if (viewport.value === 'phone') {
        return settings.accentRulePhoneOffsetX.value;
      }
      if (viewport.value === 'tablet') {
        return settings.accentRuleTabletOffsetX.value;
      }
      if (viewport.value === 'compact-desktop') {
        return settings.accentRuleCompactDesktopOffsetX.value;
      }
      return settings.accentRuleOffsetX.value;
    },
    set: (value: number) => {
      if (usesStandaloneLava.value) {
        setResponsiveLavaValue('offsetX', value);
      } else if (viewport.value === 'phone') {
        settings.accentRulePhoneOffsetX.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletOffsetX.value = value;
      } else if (viewport.value === 'compact-desktop') {
        settings.accentRuleCompactDesktopOffsetX.value = value;
      } else {
        settings.accentRuleOffsetX.value = value;
      }
    },
  });
  const offsetY = computed({
    get: () => {
      if (usesStandaloneLava.value) return responsiveLavaValue('offsetY');
      if (viewport.value === 'phone') {
        return settings.accentRulePhoneOffsetY.value;
      }
      if (viewport.value === 'tablet') {
        return settings.accentRuleTabletOffsetY.value;
      }
      if (viewport.value === 'compact-desktop') {
        return settings.accentRuleCompactDesktopOffsetY.value;
      }
      return settings.accentRuleOffsetY.value;
    },
    set: (value: number) => {
      if (usesStandaloneLava.value) {
        setResponsiveLavaValue('offsetY', value);
      } else if (viewport.value === 'phone') {
        settings.accentRulePhoneOffsetY.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletOffsetY.value = value;
      } else if (viewport.value === 'compact-desktop') {
        settings.accentRuleCompactDesktopOffsetY.value = value;
      } else {
        settings.accentRuleOffsetY.value = value;
      }
    },
  });
  const boxWidth = computed({
    get: () => {
      if (usesStandaloneLava.value) return responsiveLavaValue('boxWidth');
      if (viewport.value === 'phone') {
        return settings.accentRulePhoneBoxWidth.value;
      }
      if (viewport.value === 'tablet') {
        return settings.accentRuleTabletBoxWidth.value;
      }
      if (viewport.value === 'compact-desktop') {
        return settings.accentRuleCompactDesktopBoxWidth.value;
      }
      return settings.accentRuleBoxWidth.value;
    },
    set: (value: number) => {
      if (usesStandaloneLava.value) {
        setResponsiveLavaValue('boxWidth', value);
      } else if (viewport.value === 'phone') {
        settings.accentRulePhoneBoxWidth.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletBoxWidth.value = value;
      } else if (viewport.value === 'compact-desktop') {
        settings.accentRuleCompactDesktopBoxWidth.value = value;
      } else {
        settings.accentRuleBoxWidth.value = value;
      }
    },
  });
  const boxHeight = computed({
    get: () => {
      if (usesStandaloneLava.value) return responsiveLavaValue('boxHeight');
      if (viewport.value === 'phone') {
        return settings.accentRulePhoneBoxHeight.value;
      }
      if (viewport.value === 'tablet') {
        return settings.accentRuleTabletBoxHeight.value;
      }
      if (viewport.value === 'compact-desktop') {
        return settings.accentRuleCompactDesktopBoxHeight.value;
      }
      return settings.accentRuleBoxHeight.value;
    },
    set: (value: number) => {
      if (usesStandaloneLava.value) {
        setResponsiveLavaValue('boxHeight', value);
      } else if (viewport.value === 'phone') {
        settings.accentRulePhoneBoxHeight.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletBoxHeight.value = value;
      } else if (viewport.value === 'compact-desktop') {
        settings.accentRuleCompactDesktopBoxHeight.value = value;
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
      if (viewport.value === 'compact-desktop') {
        return settings.accentRuleCompactDesktopWaveAmplitude.value;
      }
      return settings.accentWaveAmplitude.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneWaveAmplitude.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletWaveAmplitude.value = value;
      } else if (viewport.value === 'compact-desktop') {
        settings.accentRuleCompactDesktopWaveAmplitude.value = value;
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
