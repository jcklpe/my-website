export function useSideProjectsPreview() {
  const rainbow = useState('side-projects-rainbow', () => false);
  return { rainbow };
}
