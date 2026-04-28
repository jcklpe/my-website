type FallbackPageTransitionPhase =
  | 'idle'
  | 'leaving'
  | 'entering'
  | 'entering-active';

export function useFallbackPageTransitionState() {
  return useState<FallbackPageTransitionPhase>(
    'fallback-page-transition',
    () => 'idle',
  );
}
