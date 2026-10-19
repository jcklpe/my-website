import type { ImageDissolvePattern } from '~/utils/route-image-dissolve';

export function useSideProjectsPreview() {
  const rainbow = useState('side-projects-rainbow', () => true);
  const monospace = useState('side-projects-monospace', () => false);
  const ditherPattern = useState<ImageDissolvePattern>(
    'side-projects-dither-pattern',
    () => 'floral',
  );
  return { rainbow, monospace, ditherPattern };
}
