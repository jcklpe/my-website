import { ref } from 'vue';
import { scheduleSidenoteLayout } from './useSidenoteLayout';

const expandedUuid = ref<string | null>(null);

export function useSidenoteExpanded() {
  return { expandedUuid };
}

export function toggleSidenoteExpanded(uuid: string) {
  expandedUuid.value = expandedUuid.value === uuid ? null : uuid;
  // Re-run layout so downstream notes adjust to the new height.
  // scheduleSidenoteLayout uses nextTick internally, which runs after Vue
  // has flushed the is-expanded class change to the DOM.
  scheduleSidenoteLayout();
}
