<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  const props = defineProps<{
    posts: WordPressPost[];
  }>();

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
</script>

<template>
  <div class="writing-archive-list">
    <section
      v-for="[year, yearPosts] in postsByYear"
      :key="year"
      class="year-group"
    >
      <div class="year-header" aria-hidden="true">
        <span class="year-label">{{ year }}</span>
      </div>
      <ul class="post-rows">
        <li v-for="post in yearPosts" :key="post.id" class="row-item">
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
  }

  .year-header {
    display: flex;
    justify-content: flex-end;
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
</style>
