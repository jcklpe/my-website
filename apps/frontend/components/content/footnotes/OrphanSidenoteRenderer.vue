<script setup lang="ts">
  /**
   * Renders sidenotes for footnote markers that live outside ParagraphBlock —
   * table cells, blockquotes, pullquotes, figure captions, etc.
   *
   * Desktop: FootnoteSidenote in the margin (same as paragraph footnotes).
   * Mobile: FootnoteBottomSheet slides up from the bottom of the viewport.
   *
   * Also installs a capture-phase click guard so these markers don't
   * scroll the page to the footnotes block at the bottom.
   */
  import { useFootnoteMap } from '~/composables/usePostFootnotes';
  import FootnoteSidenote from '~/components/content/footnotes/FootnoteSidenote.vue';
  import FootnoteBottomSheet from '~/components/content/footnotes/FootnoteBottomSheet.vue';

  const footnoteMap = useFootnoteMap();
  const orphans = ref<Array<{ uuid: string; number: number; contentHtml: string }>>(
    [],
  );
  const openNoteId = ref<string | null>(null);
  let collectionScheduled = false;
  let collectionFrame: number | null = null;
  let mutationObserver: MutationObserver | null = null;

  const activeNote = computed(
    () => orphans.value.find((o) => o.uuid === openNoteId.value) ?? null,
  );

  function pulseSidenote(el: HTMLElement) {
    el.classList.remove('is-pulsing');
    void el.offsetWidth;
    el.classList.add('is-pulsing');
    setTimeout(() => el.classList.remove('is-pulsing'), 650);
  }

  function collectOrphans() {
    const covered = new Set(
      [
        ...document.querySelectorAll<HTMLElement>(
          '.footnote-sidenote[data-uuid]:not(.is-orphan-sidenote)',
        ),
      ].map((el) => el.dataset.uuid!),
    );
    const seen = new Set<string>();
    const nextOrphans: Array<{
      uuid: string;
      number: number;
      contentHtml: string;
    }> = [];

    for (const marker of document.querySelectorAll<HTMLElement>('sup[data-fn]')) {
      const uuid = marker.dataset.fn;

      if (!uuid || seen.has(uuid) || covered.has(uuid)) {
        continue;
      }

      seen.add(uuid);
      const entry = footnoteMap?.value?.[uuid];

      if (!entry) {
        continue;
      }

      nextOrphans.push({ uuid, ...entry });
    }

    if (hasSameOrphans(nextOrphans)) {
      return;
    }

    orphans.value = nextOrphans;

    if (
      openNoteId.value &&
      !nextOrphans.some((orphan) => orphan.uuid === openNoteId.value)
    ) {
      openNoteId.value = null;
    }
  }

  function hasSameOrphans(
    nextOrphans: Array<{ uuid: string; number: number; contentHtml: string }>,
  ) {
    if (orphans.value.length !== nextOrphans.length) {
      return false;
    }

    return nextOrphans.every((orphan, index) => {
      const current = orphans.value[index];

      return (
        current?.uuid === orphan.uuid &&
        current.number === orphan.number &&
        current.contentHtml === orphan.contentHtml
      );
    });
  }

  function scheduleOrphanCollection() {
    if (!import.meta.client || collectionScheduled) {
      return;
    }

    collectionScheduled = true;
    nextTick(() => {
      collectionFrame = requestAnimationFrame(() => {
        collectionScheduled = false;
        collectionFrame = null;
        collectOrphans();
      });
    });
  }

  function handleDocumentClick(e: MouseEvent) {
    const sup = (e.target as Element)?.closest('sup[data-fn]');

    if (!sup) {
      return;
    }

    const uuid = (sup as HTMLElement).dataset.fn;

    if (!uuid) {
      return;
    }

    const isOrphan = orphans.value.some((o) => o.uuid === uuid);

    if (!isOrphan) {
      return;
    }

    e.preventDefault();

    // On desktop, pulse the sidenote in the margin (same as paragraph markers).
    if (window.matchMedia('(min-width: 1200px)').matches) {
      const sidenote = document.querySelector<HTMLElement>(
        `.footnote-sidenote[data-uuid="${uuid}"]`,
      );

      if (sidenote && !sidenote.classList.contains('is-overflow')) {
        pulseSidenote(sidenote);
        return;
      }
    }

    openNoteId.value = openNoteId.value === uuid ? null : uuid;
  }

  function observeContentFlow() {
    const contentFlow = document.querySelector<HTMLElement>('.content-flow');

    if (!contentFlow) {
      return;
    }

    mutationObserver = new MutationObserver(() => {
      scheduleOrphanCollection();
    });
    mutationObserver.observe(contentFlow, {
      childList: true,
      subtree: true,
    });
  }

  watch(
    () => footnoteMap?.value,
    () => scheduleOrphanCollection(),
    { immediate: true },
  );

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick, { capture: true });
    nextTick(() => {
      observeContentFlow();
      scheduleOrphanCollection();
    });
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick, { capture: true });
    mutationObserver?.disconnect();

    if (collectionFrame !== null) {
      cancelAnimationFrame(collectionFrame);
    }

    collectionScheduled = false;
  });
</script>

<template>
  <FootnoteSidenote
    v-for="entry in orphans"
    :key="entry.uuid"
    :uuid="entry.uuid"
    :number="entry.number"
    :content-html="entry.contentHtml"
    source="orphan"
  />
  <FootnoteBottomSheet
    v-if="activeNote"
    :number="activeNote.number"
    :content-html="activeNote.contentHtml"
    @close="openNoteId = null"
  />
</template>
