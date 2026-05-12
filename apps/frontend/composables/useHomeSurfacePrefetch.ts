import type {
  HomePageContent,
  WordPressCaseStudy,
  WordPressPost,
} from '~/types/wordpress';

const HOME_POST_COUNT = 10;

let homePostsRequest: Promise<WordPressPost[]> | null = null;
let homeCaseStudiesRequest: Promise<WordPressCaseStudy[]> | null = null;
let homeContentRequest: Promise<HomePageContent> | null = null;

export function useHomeSurfacePrefetch() {
  const posts = useState<WordPressPost[] | null>(
    'home-surface-posts',
    () => null,
  );
  const caseStudies = useState<WordPressCaseStudy[] | null>(
    'home-surface-case-studies',
    () => null,
  );
  const content = useState<HomePageContent | null>(
    'home-surface-content',
    () => null,
  );

  async function fetchPosts() {
    const nextPosts = await queryWordPressPosts(HOME_POST_COUNT);
    posts.value = nextPosts;

    return nextPosts;
  }

  async function fetchCaseStudies() {
    const nextCaseStudies = await queryWordPressCaseStudies();
    caseStudies.value = nextCaseStudies;

    return nextCaseStudies;
  }

  async function fetchContent() {
    const nextContent = await queryHomePageContent();
    content.value = nextContent;

    return nextContent;
  }

  async function getHomePosts() {
    if (posts.value) {
      return posts.value;
    }

    if (!import.meta.client) {
      return fetchPosts();
    }

    if (homePostsRequest) {
      return homePostsRequest;
    }

    homePostsRequest = fetchPosts().finally(() => {
      homePostsRequest = null;
    });

    return homePostsRequest;
  }

  async function getHomeCaseStudies() {
    if (caseStudies.value) {
      return caseStudies.value;
    }

    if (!import.meta.client) {
      return fetchCaseStudies();
    }

    if (homeCaseStudiesRequest) {
      return homeCaseStudiesRequest;
    }

    homeCaseStudiesRequest = fetchCaseStudies().finally(() => {
      homeCaseStudiesRequest = null;
    });

    return homeCaseStudiesRequest;
  }

  async function getHomeContent() {
    if (content.value) {
      return content.value;
    }

    if (!import.meta.client) {
      return fetchContent();
    }

    if (homeContentRequest) {
      return homeContentRequest;
    }

    homeContentRequest = fetchContent().finally(() => {
      homeContentRequest = null;
    });

    return homeContentRequest;
  }

  function prefetchHomeSurface() {
    if (!import.meta.client) {
      return;
    }

    void Promise.allSettled([
      getHomePosts(),
      getHomeCaseStudies(),
      getHomeContent(),
    ]);
  }

  return {
    getHomeCaseStudies,
    getHomeContent,
    getHomePosts,
    prefetchHomeSurface,
  };
}
