import {
  ditherGrain,
  ditherSpread,
  type ImageDissolvePattern,
} from '~/utils/ordered-dither';

export function useSideProjectsPreview() {
  const rainbow = useState('side-projects-rainbow', () => true);
  const monospace = useState('side-projects-monospace', () => false);
  const ditherPattern = useState<ImageDissolvePattern>(
    'side-projects-dither-pattern',
    () => 'bayer4',
  );
  // Replace removed preview candidates even when Nuxt preserves client state through HMR.
  const selectedPattern = String(ditherPattern.value);
  if (
    !['bayer4', 'bayer8', 'bayer16', 'rosette', 'hatch'].includes(
      selectedPattern,
    )
  )
    ditherPattern.value = selectedPattern === 'bayer' ? 'bayer8' : 'bayer4';
  const grain = useState('side-projects-dither-grain', () => 2);
  grain.value = ditherGrain(grain.value);
  const patternSpread = useState('side-projects-dither-spread', () => 0.2);
  patternSpread.value = ditherSpread(patternSpread.value);
  const motifLinger = useState(
    'side-projects-dither-motif-linger',
    () => false,
  );
  return {
    rainbow,
    monospace,
    ditherPattern,
    grain,
    patternSpread,
    motifLinger,
  };
}
