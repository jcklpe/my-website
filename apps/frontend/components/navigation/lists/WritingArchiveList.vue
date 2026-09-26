<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  const props = defineProps<{
    posts: WordPressPost[];
    transitionTargetSlug?: string;
  }>();
  const root = ref<HTMLElement | null>(null);
  const routeMotion = useRouteChoreographyState();
  const transitionState = useFeaturedMediaTransitionState();
  const readyPosts = ref(new Set<string>());
  const seatedPosts = ref(new Set<string>());
  const revealedPosts = ref(new Set<string>());
  const seatedYears = ref(new Set<number>());
  const animations = new Set<Animation>();
  let mounted = false;
  let running = false;
  let initialArrival = true;
  const originIndex = computed(() =>
    props.posts.findIndex((post) => post.slug === props.transitionTargetSlug),
  );
  const canReveal = computed(() => {
    const state = transitionState.value;
    if (state.phase === 'preflight') return false;
    if (!state.active) return true;
    const key = `post-${props.transitionTargetSlug}`.replace(
      /[^a-zA-Z0-9_-]/g,
      '-',
    );
    return (
      state.sourceRole === 'target' &&
      state.key === key &&
      state.archiveEntranceReady
    );
  });

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
    if (!mounted || running || !canReveal.value) return;
    running = true;
    const reduced =
      routeMotion.value.active ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const selected = props.posts.find(
      (post) => post.slug === props.transitionTargetSlug,
    );
    const selectedIndex = selected ? props.posts.indexOf(selected) : 0;
    const selectedRect = selected && rowFor(selected)?.getBoundingClientRect();
    type Unit = {
      element: HTMLElement;
      rect: DOMRect;
      post?: WordPressPost;
      year?: number;
    };
    const rings = new Map<number, Unit[]>();
    function addUnit(index: number, unit: Unit) {
      const ring = selected ? Math.abs(index - selectedIndex) : index;
      if (!rings.has(ring)) rings.set(ring, []);
      rings.get(ring)!.push(unit);
    }
    for (const [index, post] of props.posts.entries()) {
      if (seatedPosts.value.has(post.id) || !readyPosts.value.has(post.id))
        continue;
      const element = rowFor(post);
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      if (reduced || rect.bottom <= 0 || rect.top >= window.innerHeight) {
        seatedPosts.value.add(post.id);
        revealedPosts.value.add(post.id);
      } else {
        addUnit(index, { element, rect, post });
      }
    }
    for (const [year, yearPosts] of postsByYear.value) {
      if (seatedYears.value.has(year)) continue;
      const element = root.value?.querySelector<HTMLElement>(
        `[data-archive-year="${year}"]`,
      );
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      if (reduced || rect.bottom <= 0 || rect.top >= window.innerHeight)
        seatedYears.value.add(year);
      else addUnit(props.posts.indexOf(yearPosts[0]!), { element, rect, year });
    }
    // Start each ring on a short cadence while the previous ring’s ink is still entering. Shell completion only releases its own animation, never gates the next ring.
    const ringInterval = writingArchiveMotionDuration('--writing-ring-stagger');
    for (const [ring, units] of [...rings.entries()].sort(
      ([a], [b]) => a - b,
    )) {
      if (!mounted || !canReveal.value) break;
      const startedAt = performance.now();
      const immediate: WordPressPost[] = [];
      for (const unit of units) {
        const shared = unit.post === selected && initialArrival;
        if (selectedRect && !shared && initialArrival) {
          const style = getComputedStyle(document.documentElement);
          const animation = unit.element.animate(
            [
              {
                transform: writingArchiveDisplacement(
                  unit.rect,
                  selectedRect,
                  'in',
                ),
              },
              { transform: 'translate(0)' },
            ],
            {
              duration: writingArchiveMotionDuration(),
              easing: style.getPropertyValue('--snappy-ease-out').trim(),
              fill: 'both',
            },
          );
          animations.add(animation);
          const revealAt = window.setTimeout(() => {
            // Ink begins while this shell is still arriving; the next ring does not need to wait for touchdown.
            if (mounted && canReveal.value && unit.post)
              revealedPosts.value.add(unit.post.id);
          }, writingArchiveMotionDuration() * 0.45);
          void animation.finished
            .then(() => {
              // A finished animation also releases ink if the timer was delayed by a busy frame.
              if (mounted && canReveal.value && unit.post)
                revealedPosts.value.add(unit.post.id);
            })
            .catch(() => undefined)
            .finally(() => {
              clearTimeout(revealAt);
              animation.cancel();
              animations.delete(animation);
            });
        } else if (unit.post) immediate.push(unit.post);
        if (unit.post) seatedPosts.value.add(unit.post.id);
        if (unit.year !== undefined) seatedYears.value.add(unit.year);
      }
      // The origin is already seated: release its row gate and start the first neighbors in the same update, without waiting for another paint.
      if (selected && ring === 0) {
        for (const post of immediate) revealedPosts.value.add(post.id);
        continue;
      }
      await paint();
      if (!mounted) break;
      for (const post of immediate) revealedPosts.value.add(post.id);
      await paint();
      const remaining = ringInterval - (performance.now() - startedAt);
      if (remaining > 0)
        await new Promise<void>((resolve) => setTimeout(resolve, remaining));
    }
    running = false;
    if (
      mounted &&
      canReveal.value &&
      props.posts.some(
        (post) =>
          readyPosts.value.has(post.id) && !seatedPosts.value.has(post.id),
      )
    )
      void revealRows();
    if (seatedPosts.value.size === props.posts.length) initialArrival = false;
  }

  function mediaReady(id: string) {
    readyPosts.value.add(id);
    void revealRows();
  }
  watch(canReveal, (ready) => {
    if (ready) void revealRows();
  });
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
      <div
        class="year-header"
        :data-archive-year="year"
        :class="{ 'is-waiting': !seatedYears.has(year) }"
      >
        <h2 class="year-label">{{ year }}</h2>
      </div>
      <ul class="post-rows">
        <li
          v-for="post in yearPosts"
          :key="post.id"
          class="row-item"
          :data-archive-post="post.id"
          :style="{
            '--slit-entry-offset':
              posts.indexOf(post) < originIndex ? '-110%' : '110%',
          }"
          :class="{
            'is-waiting':
              !seatedPosts.has(post.id) && post.slug !== transitionTargetSlug,
          }"
        >
          <PostArchiveRow
            :post="post"
            :body-first="posts.indexOf(post) < originIndex"
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

  .is-waiting {
    visibility: hidden;
  }
</style>
