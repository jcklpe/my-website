type AccentRuleViewport =
  | 'desktop'
  | 'compact-desktop'
  | 'narrow-desktop'
  | 'tablet'
  | 'phone';

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
          : window.innerWidth < 1892
            ? window.innerWidth < 1400
              ? 'narrow-desktop'
              : 'compact-desktop'
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
      if (viewport.value === 'compact-desktop') {
        return settings.accentRuleCompactDesktopOffsetX.value;
      }
      if (viewport.value === 'narrow-desktop') {
        return settings.accentRuleNarrowDesktopOffsetX.value;
      }
      return settings.accentRuleOffsetX.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneOffsetX.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletOffsetX.value = value;
      } else if (viewport.value === 'compact-desktop') {
        settings.accentRuleCompactDesktopOffsetX.value = value;
      } else if (viewport.value === 'narrow-desktop') {
        settings.accentRuleNarrowDesktopOffsetX.value = value;
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
      if (viewport.value === 'compact-desktop') {
        return settings.accentRuleCompactDesktopOffsetY.value;
      }
      if (viewport.value === 'narrow-desktop') {
        return settings.accentRuleNarrowDesktopOffsetY.value;
      }
      return settings.accentRuleOffsetY.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneOffsetY.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletOffsetY.value = value;
      } else if (viewport.value === 'compact-desktop') {
        settings.accentRuleCompactDesktopOffsetY.value = value;
      } else if (viewport.value === 'narrow-desktop') {
        settings.accentRuleNarrowDesktopOffsetY.value = value;
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
      if (viewport.value === 'compact-desktop') {
        return settings.accentRuleCompactDesktopBoxWidth.value;
      }
      if (viewport.value === 'narrow-desktop') {
        return settings.accentRuleNarrowDesktopBoxWidth.value;
      }
      return settings.accentRuleBoxWidth.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneBoxWidth.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletBoxWidth.value = value;
      } else if (viewport.value === 'compact-desktop') {
        settings.accentRuleCompactDesktopBoxWidth.value = value;
      } else if (viewport.value === 'narrow-desktop') {
        settings.accentRuleNarrowDesktopBoxWidth.value = value;
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
      if (viewport.value === 'compact-desktop') {
        return settings.accentRuleCompactDesktopBoxHeight.value;
      }
      if (viewport.value === 'narrow-desktop') {
        return settings.accentRuleNarrowDesktopBoxHeight.value;
      }
      return settings.accentRuleBoxHeight.value;
    },
    set: (value: number) => {
      if (viewport.value === 'phone') {
        settings.accentRulePhoneBoxHeight.value = value;
      } else if (viewport.value === 'tablet') {
        settings.accentRuleTabletBoxHeight.value = value;
      } else if (viewport.value === 'compact-desktop') {
        settings.accentRuleCompactDesktopBoxHeight.value = value;
      } else if (viewport.value === 'narrow-desktop') {
        settings.accentRuleNarrowDesktopBoxHeight.value = value;
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
      if (viewport.value === 'narrow-desktop') {
        return settings.accentRuleNarrowDesktopWaveAmplitude.value;
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
      } else if (viewport.value === 'narrow-desktop') {
        settings.accentRuleNarrowDesktopWaveAmplitude.value = value;
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
