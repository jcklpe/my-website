import type { CodeThemeName } from '~/utils/code-theme';
import { CODE_THEME_LABELS } from '~/utils/code-theme';

export function useCodeTheme() {
  const themeName = useState<CodeThemeName>('code-theme', () => 'midnight');

  // Guard against stale cached values from previous builds where theme names differed.
  if (!(themeName.value in CODE_THEME_LABELS)) {
    themeName.value = 'midnight';
  }

  return { themeName };
}
