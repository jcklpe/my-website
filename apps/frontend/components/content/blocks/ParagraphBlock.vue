<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';
  import { useFootnoteMap } from '~/composables/usePostFootnotes';
  import FootnoteInNote from '~/components/content/footnotes/FootnoteInNote.vue';
  import FootnoteSidenote from '~/components/content/footnotes/FootnoteSidenote.vue';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const paragraph = computed(() =>
    extractRootElement(props.block.renderedHtml, 'p'),
  );
  const paragraphClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(paragraph.value?.attributes, 'class'),
    ),
  );

  const footnoteMap = useFootnoteMap();

  const sidenoteEntries = computed(() => {
    if (!footnoteMap || !paragraph.value?.innerHtml) return [];
    const html = paragraph.value.innerHtml;
    const matches = html.matchAll(/data-fn="([a-zA-Z0-9_-]+)"/g);
    return Array.from(matches, (m) => m[1]).flatMap((uuid) => {
      const entry = footnoteMap.value[uuid];
      return entry ? [{ uuid, ...entry }] : [];
    });
  });

  const hasFootnotes = computed(() => sidenoteEntries.value.length > 0);

  const openNoteId = ref<string | null>(null);
  const isOverflowNote = ref(false);
  const isClosingNote = ref(false);
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  // Delays clearing openNoteId until after the in-note leave animation finishes.
  // While the timer is running, paragraphSplit stays truthy so the template
  // stays mounted and the animation can play.
  const CLOSE_ANIMATION_MS = 160;
  function startClose() {
    if (isClosingNote.value) return;
    isClosingNote.value = true;
    closeTimer = setTimeout(() => {
      openNoteId.value = null;
      isOverflowNote.value = false;
      isClosingNote.value = false;
      closeTimer = null;
    }, CLOSE_ANIMATION_MS);
  }

  onMounted(() => {
    const mq = window.matchMedia('(min-width: 1200px)');
    function onWiden(e: MediaQueryListEvent) {
      if (!e.matches || !openNoteId.value) return;
      // Viewport widened to desktop — sidenote takes over, collapse the in-note immediately
      // (no leave animation needed since the in-note is already display:none at this width).
      if (closeTimer !== null) { clearTimeout(closeTimer); closeTimer = null; }
      openNoteId.value = null;
      isOverflowNote.value = false;
      isClosingNote.value = false;
    }
    mq.addEventListener('change', onWiden);
    onUnmounted(() => mq.removeEventListener('change', onWiden));
  });

  onUnmounted(() => {
    if (closeTimer !== null) clearTimeout(closeTimer);
  });

  const activeNote = computed(() =>
    openNoteId.value && footnoteMap?.value[openNoteId.value]
      ? footnoteMap.value[openNoteId.value]
      : null,
  );

  // Splits paragraph HTML at the open footnote marker.
  // The marker number is replaced with × in the `before` fragment.
  const paragraphSplit = computed((): { before: string; after: string } | null => {
    if (!openNoteId.value || !paragraph.value?.innerHtml) return null;
    const html = paragraph.value.innerHtml;
    const uuid = openNoteId.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(<sup[^>]+data-fn="${uuid}"[^>]*>[\\s\\S]*?<\\/sup>)`);
    const match = pattern.exec(html);
    if (!match) return null;
    const markerWithX = match[1]
      .replace(/(<a[^>]*>)\d+(<\/a>)/, '$1×$2')
      .replace(/(<sup)/, '$1 data-is-open="true"');
    return {
      before: html.slice(0, match.index) + markerWithX,
      after: html.slice(match.index + match[0].length),
    };
  });

  function handleParagraphClick(event: MouseEvent) {
    const target = event.target as Element | null;
    const sup = target?.closest?.('sup[data-fn]');
    if (!sup) return;

    const uuid = sup.getAttribute('data-fn');
    if (!uuid || !footnoteMap?.value[uuid]) return;

    // On desktop, normal sidenotes are already visible in the margin —
    // pulse them so the user can find them. Overflow sidenotes open as in-notes.
    if (window.matchMedia('(min-width: 1200px)').matches) {
      const sidenote = document.querySelector<HTMLElement>(
        `.footnote-sidenote[data-uuid="${uuid}"]`,
      );
      if (!sidenote?.classList.contains('is-overflow')) {
        event.preventDefault();
        pulseSidenote(sidenote!);
        return;
      }
      event.preventDefault();
      if (openNoteId.value === uuid) {
        startClose();
      } else {
        if (closeTimer !== null) { clearTimeout(closeTimer); closeTimer = null; isClosingNote.value = false; }
        openNoteId.value = uuid;
        isOverflowNote.value = true;
      }
      return;
    }

    event.preventDefault();
    isOverflowNote.value = false;
    if (openNoteId.value === uuid) {
      startClose();
    } else {
      if (closeTimer !== null) { clearTimeout(closeTimer); closeTimer = null; isClosingNote.value = false; }
      openNoteId.value = uuid;
    }
  }

  function pulseSidenote(el: HTMLElement) {
    el.classList.remove('is-pulsing');
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add('is-pulsing');
    setTimeout(() => el.classList.remove('is-pulsing'), 650);
  }
</script>

<template>
  <!-- Split view: text before marker, in-note, text continuation. -->
  <template v-if="paragraphSplit">
    <p
      class="paragraph-pre-note"
      :class="paragraphClass"
      @click.capture="handleParagraphClick($event)"
      v-html="paragraphSplit.before"
    />
    <FootnoteInNote
      :number="activeNote!.number"
      :content-html="activeNote!.contentHtml"
      :force-desktop-visible="isOverflowNote"
      :is-leaving="isClosingNote"
      @close="startClose"
    />
    <p
      v-if="paragraphSplit.after"
      class="paragraph-continuation"
      :class="paragraphClass"
      @click.capture="handleParagraphClick($event)"
      v-html="paragraphSplit.after"
    />
  </template>

  <!-- Normal view: unsplit paragraph. -->
  <p
    v-else-if="paragraph"
    :class="paragraphClass"
    @click.capture="hasFootnotes ? handleParagraphClick($event) : undefined"
    v-html="paragraph.innerHtml"
  />

  <!-- Desktop: always-visible Tufte sidenotes in the right margin.
       position:absolute means zero grid rows — no gap in the content flow. -->
  <FootnoteSidenote
    v-for="entry in sidenoteEntries"
    :key="entry.uuid"
    :uuid="entry.uuid"
    :number="entry.number"
    :content-html="entry.contentHtml"
  />
</template>

<style lang="scss" scoped>
  p {
    @include paragraph-block;
    @include paragraph-deep-links;
  }

  // The paragraph whose marker triggered the in-note — no bottom margin so the
  // note sits flush below the text.
  p.paragraph-pre-note {
    margin-bottom: 0;
  }

  // Continuation paragraph after the in-note — no top margin so it reads as
  // the same paragraph continuing below the note.
  p.paragraph-continuation {
    margin-top: 0;
  }

  // Footnote markers come through via v-html; global styles in _vue-frontend.scss
  // handle colour and font. Only the scoped hover/focus treatment is added here so
  // the marker responds to the paragraph's pointer context correctly.
  p :deep(sup[data-fn] a:focus-visible) {
    outline-offset: 2px;
  }
</style>
