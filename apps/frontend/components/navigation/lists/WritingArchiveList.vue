<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  const props = defineProps<{
    posts: WordPressPost[];
    transitionTargetSlug?: string;
  }>();

  const transitionState = useFeaturedMediaTransitionState();
  const sequenceStarted = ref(false);
  let sequenceFallbackTimer = 0;
  let sequenceFrame = 0;

  // "January 5, 2026" — year is always the 4-digit number in the formatted string
  function extractYear(dateStr: string): number {
    return parseInt(/\d{4}/.exec(dateStr)?.[0] ?? '0');
  }

  const postsByYear = computed((): [number, WordPressPost[]][] => {
    const groups = new Map<number, WordPressPost[]>();
    for (const post of props.posts) {
      const year = extractYear(post.date);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(post);
    }
    return [...groups.entries()].sort(([a], [b]) => b - a);
  });

  const sequenceOrders = computed(() => {
    const years = new Map<number, number>();
    const posts = new Map<string, number>();
    let order = 0;

    for (const [year, yearPosts] of postsByYear.value) {
      years.set(year, order);
      order += 1;
      for (const post of yearPosts) {
        posts.set(post.id, order);
        order += 1;
      }
    }

    return { posts, years };
  });

  const transitionTargetPostIndex = computed(() =>
    props.posts.findIndex((post) => post.slug === props.transitionTargetSlug),
  );

  const isReverseSequence = computed(
    () => transitionTargetPostIndex.value >= 0,
  );

  function postMotionOffset(post: WordPressPost) {
    if (!isReverseSequence.value)
      return sequenceOrders.value.posts.get(post.id) ?? 0;

    const postIndex = props.posts.findIndex(
      (candidate) => candidate.id === post.id,
    );
    return postIndex - transitionTargetPostIndex.value;
  }

  function yearMotionOffset(year: number, yearPosts: WordPressPost[]) {
    if (!isReverseSequence.value)
      return sequenceOrders.value.years.get(year) ?? 0;

    const firstPost = yearPosts[0];
    const firstPostIndex = firstPost
      ? props.posts.findIndex((post) => post.id === firstPost.id)
      : transitionTargetPostIndex.value;
    return firstPostIndex - transitionTargetPostIndex.value - 0.5;
  }

  function sequenceStyle(order: number, motionOffset = order) {
    const offset = isReverseSequence.value
      ? motionOffset
      : Math.min(8, motionOffset);
    let duration = 620;
    let delay = 120 + offset * 140;

    if (isReverseSequence.value) {
      if (offset < 0) {
        duration = 300;
        delay = 600 + offset * 140 - duration;
      } else if (offset === 0) {
        duration = 600;
        delay = 0;
      } else {
        delay = 600 + offset * 140 - duration;
      }
    }

    return {
      '--sequence-order': order,
      '--sequence-duration': `${duration}ms`,
      '--sequence-delay': `${Math.max(0, delay)}ms`,
    };
  }

  function isSequenceParticipant(motionOffset: number) {
    if (!isReverseSequence.value) return motionOffset <= 8;

    return motionOffset >= -2.5 && motionOffset <= 6;
  }

  function startSequence() {
    sequenceStarted.value = true;
    window.clearTimeout(sequenceFallbackTimer);
  }

  watch(
    () => transitionState.value.phase,
    (phase) => {
      if (isReverseSequence.value && phase === 'moving') startSequence();
    },
  );

  onMounted(() => {
    if (isReverseSequence.value) {
      if (transitionState.value.phase === 'moving') startSequence();
      sequenceFallbackTimer = window.setTimeout(startSequence, 1600);
      return;
    }

    sequenceFrame = window.requestAnimationFrame(() => {
      sequenceFallbackTimer = window.setTimeout(startSequence, 120);
    });
  });

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(sequenceFrame);
    window.clearTimeout(sequenceFallbackTimer);
  });
</script>

<template>
  <div
    class="writing-archive-list"
    :class="{
      'is-sequence-started': sequenceStarted,
      'is-reverse-sequence': isReverseSequence,
    }"
  >
    <section
      v-for="[year, yearPosts] in postsByYear"
      :key="year"
      class="year-group"
    >
      <div
        class="year-header sequence-item"
        :class="{
          'is-sequence-participant': isSequenceParticipant(
            yearMotionOffset(year, yearPosts),
          ),
        }"
        :style="
          sequenceStyle(
            sequenceOrders.years.get(year) ?? 0,
            yearMotionOffset(year, yearPosts),
          )
        "
        aria-hidden="true"
      >
        <span class="year-label">{{ year }}</span>
      </div>
      <ul class="post-rows">
        <li
          v-for="(post, index) in yearPosts"
          :key="post.id"
          class="row-item sequence-item"
          :class="{
            'is-sequence-participant': isSequenceParticipant(
              postMotionOffset(post),
            ),
          }"
          :style="
            sequenceStyle(
              sequenceOrders.posts.get(post.id) ?? index,
              postMotionOffset(post),
            )
          "
        >
          <PostArchiveRow :post="post" />
        </li>
      </ul>
    </section>
  </div>
</template>

<style lang="scss" scoped>
  .writing-archive-list {
    margin: 0;
  }

  .year-group {
    margin-bottom: var(--space-8);

    @include breakpoint(phone) {
      margin-bottom: var(--space-6);
    }
  }

  .year-header {
    display: flex;
    justify-content: flex-end;
    padding-inline: var(--space-4);
    padding-bottom: var(--space-3);
    border-bottom: 2px solid var(--color-primary);
  }

  .year-label {
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-style: italic;
    font-size: clamp(1.1rem, 2.5vw, 1.6rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .post-rows {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row-item {
    min-width: 0;
  }

  .sequence-item.is-sequence-participant {
    clip-path: inset(100% 0 0);
    opacity: 0;
    will-change: clip-path, opacity;
  }

  .is-sequence-started .sequence-item.is-sequence-participant {
    animation: writing-row-arrive var(--sequence-duration, 620ms)
      var(--snappy-ease-out) both;
    animation-delay: var(--sequence-delay, 120ms);
  }

  @keyframes writing-row-arrive {
    from {
      clip-path: inset(100% 0 0);
      opacity: 0;
    }

    to {
      clip-path: inset(0);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sequence-item.is-sequence-participant,
    .is-sequence-started .sequence-item.is-sequence-participant,
    .is-reverse-sequence.is-sequence-started
      .sequence-item.is-sequence-participant {
      clip-path: inset(0);
      opacity: 1;
      animation: none;
    }
  }
</style>
