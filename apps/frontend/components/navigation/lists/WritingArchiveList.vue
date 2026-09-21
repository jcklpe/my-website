<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  const props = defineProps<{
    posts: WordPressPost[];
    transitionTargetSlug?: string;
  }>();
  const root = ref<HTMLElement | null>(null);
  const transitionState = useFeaturedMediaTransitionState();
  const readyPosts = ref(new Set<string>());
  const seatedPosts = ref(new Set<string>());
  const revealedPosts = ref(new Set<string>());
  const animations = new Set<Animation>();
  let mounted = false;
  let running = false;
  let initialArrival = true;

  const postsByYear = computed((): [number, WordPressPost[]][] => {
    const groups = new Map<number, WordPressPost[]>();
    for (const post of props.posts) {
      const year = parseInt(/\d{4}/.exec(post.date)?.[0] ?? '0');
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(post);
    }
    return [...groups.entries()].sort(([a], [b]) => b - a);
  });

  function rowFor(post: WordPressPost) {
    return root.value?.querySelector<HTMLElement>(
      `[data-archive-post="${post.id}"]`,
    );
  }

  async function paint() {
    await nextTick();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  }

  async function revealRows() {
    if (!mounted || running || transitionState.value.active) return;
    running = true;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const selected = props.posts.find(
      (post) => post.slug === props.transitionTargetSlug,
    );
    const selectedRect = selected && rowFor(selected)?.getBoundingClientRect();
    // The shared row is already seated. Its extras finish first, then each neighboring row gets the same complete part entrance.
    const pending = props.posts.filter(
      (post) => !revealedPosts.value.has(post.id),
    );
    if (selected)
      pending.sort(
        (a, b) =>
          Math.abs(props.posts.indexOf(a) - props.posts.indexOf(selected)) -
          Math.abs(props.posts.indexOf(b) - props.posts.indexOf(selected)),
      );
    for (const post of pending) {
      if (!mounted || transitionState.value.active) break;
      if (!readyPosts.value.has(post.id)) continue;
      const row = rowFor(post);
      if (!row) continue;
      const rect = row.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      const shared = post === selected && initialArrival;
      if (visible && !reduced && selectedRect && !shared && initialArrival) {
        const style = getComputedStyle(document.documentElement);
        const animation = row.animate(
          [
            { transform: writingArchiveDisplacement(rect, selectedRect) },
            { transform: 'translate(0)' },
          ],
          {
            duration: writingArchiveMotionDuration(),
            easing: style.getPropertyValue('--snappy-ease-out').trim(),
            fill: 'both',
          },
        );
        animations.add(animation);
        seatedPosts.value.add(post.id);
        void animation.finished.then(
          () => {
            animation.cancel();
            animations.delete(animation);
          },
          () => {},
        );
      } else {
        seatedPosts.value.add(post.id);
      }
      if (!mounted) break;
      await paint();
      revealedPosts.value.add(post.id);
      await paint();
      if (visible && !reduced) {
        const parts = row.getAnimations({ subtree: true });
        await Promise.allSettled(parts.map((animation) => animation.finished));
      }
    }
    running = false;
    if (
      mounted &&
      !transitionState.value.active &&
      props.posts.some(
        (post) =>
          readyPosts.value.has(post.id) && !revealedPosts.value.has(post.id),
      )
    )
      void revealRows();
    if (revealedPosts.value.size === props.posts.length) initialArrival = false;
  }

  function mediaReady(id: string) {
    readyPosts.value.add(id);
    void revealRows();
  }
  watch(
    () => transitionState.value.active,
    (active) => {
      if (!active) void revealRows();
    },
  );
  onMounted(() => {
    mounted = true;
    void revealRows();
  });
  onBeforeUnmount(() => {
    mounted = false;
    for (const animation of animations) animation.cancel();
  });
</script>

<template>
  <div ref="root" class="writing-archive-list">
    <section
      v-for="[year, yearPosts] in postsByYear"
      :key="year"
      class="year-group"
    >
      <div class="year-header">
        <h2 class="year-label">{{ year }}</h2>
      </div>
      <ul class="post-rows">
        <li
          v-for="post in yearPosts"
          :key="post.id"
          class="row-item"
          :data-archive-post="post.id"
          :class="{
            'is-waiting':
              !seatedPosts.has(post.id) && post.slug !== transitionTargetSlug,
          }"
        >
          <PostArchiveRow
            :post="post"
            :concealed="!revealedPosts.has(post.id)"
            :shared-arrival="post.slug === transitionTargetSlug"
            @media-ready="mediaReady(post.id)"
          />
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
    margin: 0;
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

  .row-item.is-waiting {
    visibility: hidden;
  }
</style>
