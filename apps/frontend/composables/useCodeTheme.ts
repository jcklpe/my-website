import type { CodeThemeName } from '~/utils/code-theme';
import { CODE_THEME_LABELS } from '~/utils/code-theme';
import { cycleCodeTheme } from '~/utils/code-hue-cycle';

export function useCodeTheme() {
  const themeName = useState<CodeThemeName>('code-theme', () => 'midnight');
  const reverseHueCycle = useState('code-theme-reverse-hue-cycle', () => false);
  const codeBlockCount = useState('code-block-count', () => 0);

  // Guard against stale cached values from previous builds where theme names differed.
  if (!(themeName.value in CODE_THEME_LABELS)) {
    themeName.value = 'midnight';
  }

  function setTheme(nextTheme: CodeThemeName) {
    if (themeName.value === nextTheme) return;
    const applyTheme = () => {
      themeName.value = nextTheme;
    };
    if (import.meta.client && reverseHueCycle.value) {
      cycleCodeTheme(nextTheme, applyTheme);
    } else applyTheme();
  }

  return { themeName, reverseHueCycle, codeBlockCount, setTheme };
}
