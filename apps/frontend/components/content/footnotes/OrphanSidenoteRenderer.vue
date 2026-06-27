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

  const activeNote = computed(
    () => orphans.value.find((o) => o.uuid === openNoteId.value) ?? null,
  );

  function pulseSidenote(el: HTMLElement) {
    el.classList.remove('is-pulsing');
    void el.offsetWidth;
    el.classList.add('is-pulsing');
    setTimeout(() => el.classList.remove('is-pulsing'), 650);
  }

  onMounted(() => {
    nextTick(() => {
      const covered = new Set(
        [...document.querySelectorAll<HTMLElement>('.footnote-sidenote[data-uuid]')].map(
          (el) => el.dataset.uuid!,
        ),
      );

      const seen = new Set<string>();
      for (const marker of document.querySelectorAll<HTMLElement>('sup[data-fn]')) {
        const uuid = marker.dataset.fn;
        if (!uuid || seen.has(uuid) || covered.has(uuid)) continue;
        seen.add(uuid);
        const entry = footnoteMap?.value?.[uuid];
        if (!entry) continue;
        orphans.value.push({ uuid, ...entry });
      }

      document.addEventListener(
        'click',
        (e) => {
          const sup = (e.target as Element)?.closest('sup[data-fn]');
          if (!sup) return;
          e.preventDefault();
          const uuid = (sup as HTMLElement).dataset.fn;
          if (!uuid) return;
          const isOrphan = orphans.value.some((o) => o.uuid === uuid);
          if (!isOrphan) return;

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
        },
        { capture: true },
      );
    });
  });
</script>

<template>
  <FootnoteSidenote
    v-for="entry in orphans"
    :key="entry.uuid"
    :uuid="entry.uuid"
    :number="entry.number"
    :content-html="entry.contentHtml"
  />
  <FootnoteBottomSheet
    v-if="activeNote"
    :number="activeNote.number"
    :content-html="activeNote.contentHtml"
    @close="openNoteId = null"
  />
</template>
