export function useSideProjectsPreview() {
  const rainbow = useState('side-projects-rainbow', () => true);
  return { rainbow };
}
