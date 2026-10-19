import type { ImageDissolvePattern } from '~/utils/route-image-dissolve';

export function useSideProjectsPreview() {
  const rainbow = useState('side-projects-rainbow', () => true);
  const monospace = useState('side-projects-monospace', () => false);
  const ditherPattern = useState<ImageDissolvePattern>(
    'side-projects-dither-pattern',
    () => 'atkinson',
  );
  // Replace removed preview candidates even when Nuxt preserves client state through HMR.
  if (!['atkinson', 'bayer'].includes(ditherPattern.value))
    ditherPattern.value = 'atkinson';
  return { rainbow, monospace, ditherPattern };
}
