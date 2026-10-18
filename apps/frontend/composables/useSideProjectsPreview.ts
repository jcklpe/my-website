export function useSideProjectsPreview() {
  const rainbow = useState('side-projects-rainbow', () => true);
  const monospace = useState('side-projects-monospace', () => false);
  return { rainbow, monospace };
}
