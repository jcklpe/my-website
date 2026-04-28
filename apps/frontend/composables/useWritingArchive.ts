import type {
  WordPressPageInfo,
  WordPressPost,
  WordPressPostsPage,
} from '~/types/wordpress';

const WRITING_ARCHIVE_PAGE_SIZE = 30;

function emptyPageInfo(): WordPressPageInfo {
  return {
    hasNextPage: false,
    endCursor: null,
  };
}

export function useWritingArchive() {
  const posts = useState<WordPressPost[]>('writing-archive-posts', () => []);
  const pageInfo = useState<WordPressPageInfo>(
    'writing-archive-page-info',
    emptyPageInfo,
  );
  const hasLoadedInitialPage = useState(
    'writing-archive-has-loaded-initial-page',
    () => false,
  );
  const isLoadingMore = useState(
    'writing-archive-is-loading-more',
    () => false,
  );
  const loadMoreError = useState('writing-archive-load-more-error', () => '');

  function hydrateArchive(initialPage?: WordPressPostsPage | null) {
    if (!initialPage || hasLoadedInitialPage.value) {
      return;
    }

    posts.value = initialPage.posts;
    pageInfo.value = initialPage.pageInfo;
    hasLoadedInitialPage.value = true;
  }

  function hasPost(slug: string) {
    return posts.value.some((post) => post.slug === slug);
  }

  async function queryInitialArchivePage() {
    if (hasLoadedInitialPage.value) {
      return {
        posts: posts.value,
        pageInfo: pageInfo.value,
      };
    }

    return queryWordPressPostsPage(WRITING_ARCHIVE_PAGE_SIZE);
  }

  async function loadMorePosts() {
    if (isLoadingMore.value || !pageInfo.value.hasNextPage) {
      return;
    }

    isLoadingMore.value = true;
    loadMoreError.value = '';

    try {
      const nextPage = await queryWordPressPostsPage(
        WRITING_ARCHIVE_PAGE_SIZE,
        pageInfo.value.endCursor,
      );
      const existingPostIds = new Set(posts.value.map((post) => post.id));
      const newPosts = nextPage.posts.filter(
        (post) => !existingPostIds.has(post.id),
      );

      posts.value = [...posts.value, ...newPosts];
      pageInfo.value = nextPage.pageInfo;
    } catch {
      loadMoreError.value =
        'More writing could not be loaded. Try again in a moment.';
    } finally {
      isLoadingMore.value = false;
    }
  }

  async function ensurePostIsVisible(slug: string, maxAdditionalPages = 4) {
    let loadedAdditionalPages = 0;

    while (
      slug &&
      !hasPost(slug) &&
      pageInfo.value.hasNextPage &&
      loadedAdditionalPages < maxAdditionalPages
    ) {
      await loadMorePosts();
      loadedAdditionalPages++;
    }
  }

  return {
    ensurePostIsVisible,
    hydrateArchive,
    isLoadingMore,
    loadMoreError,
    loadMorePosts,
    pageInfo,
    posts,
    queryInitialArchivePage,
  };
}
