import type { CodeThemeName } from '~/utils/syntax-highlighting';
import { CODE_THEME_LABELS } from '~/utils/syntax-highlighting';

export function useCodeTheme() {
  const themeName = useState<CodeThemeName>('code-theme', () => 'midnight');

  // Guard against stale cached values from previous builds where theme names differed.
  if (!(themeName.value in CODE_THEME_LABELS)) {
    themeName.value = 'midnight';
  }

  return { themeName };
}
