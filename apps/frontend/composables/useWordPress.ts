import type {
  EmployerTestimonial,
  FooterSettings,
  GutenbergBlock,
  HomePageContent,
  SiteLink,
  WordPressCaseStudiesResponse,
  WordPressCaseStudy,
  WordPressEmployerTestimonial,
  WordPressFooterSettingsResponse,
  WordPressHomePageResponse,
  WordPressPageInfo,
  WordPressPost,
  WordPressPostsPage,
  WordPressPostsResponse,
  WordPressSingleCaseStudyResponse,
  WordPressSinglePostResponse,
} from '~/types/wordpress';

const featuredImageFields = `
  featuredImage {
    node {
      id
      sourceUrl
      srcSet
      sizes
      altText
      mediaDetails {
        width
        height
        sizes {
          name
          sourceUrl
          width
          height
          mimeType
          file
          fileSize
        }
      }
    }
  }
`;

const postsQuery = `
  query GetPosts($first: Int = 12, $after: String) {
    posts(first: $first, after: $after) {
      nodes {
        id
        slug
        date
        title
        excerpt
        ${featuredImageFields}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const caseStudiesQuery = `
  query GetCaseStudies($first: Int = 12) {
    caseStudies(first: $first) {
      nodes {
        id
        slug
        title
        excerpt
        ${featuredImageFields}
      }
    }
  }
`;

const homePageQuery = `
  query GetHomePageContent {
    nodeByUri(uri: "/") {
      ... on Page {
        megaText
        heroTitle
        heroSubtitle
        aboutTagline
        homepageQuickLinks {
          label
          url
        }
        homepageEmployerTestimonials {
          quote
          name
          role
          organization
        }
      }
    }
  }
`;

const fallbackEmployerTestimonials: EmployerTestimonial[] = [
  {
    quote:
      'Placeholder employer testimonial copy can live here until the real quote is ready.',
    name: 'Future employer',
    role: 'Role or team',
    organization: 'Organization',
  },
  {
    quote:
      'This section is wired for multiple testimonials, so it can grow without changing the page structure.',
    name: 'Future collaborator',
    role: 'Project partner',
    organization: 'Organization',
  },
  {
    quote:
      'Use this row for a concise note about communication, judgment, craft, or delivery.',
    name: 'Future manager',
    role: 'Department',
    organization: 'Organization',
  },
];

const footerSettingsQuery = `
  query GetFooterSettings {
    footerSettings {
      heading
      body
      links {
        label
        url
      }
      note
    }
  }
`;

const postBySlugQuery = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      slug
      date
      author {
        node {
          name
        }
      }
      title
      excerpt
      ${featuredImageFields}
      editorBlocks(flat: true) {
        name
        clientId
        parentClientId
        renderedHtml
      }
    }
  }
`;

const postShellBySlugQuery = `
  query GetPostShellBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      slug
      date
      author {
        node {
          name
        }
      }
      title
      excerpt
      ${featuredImageFields}
    }
  }
`;

const postBlocksBySlugQuery = `
  query GetPostBlocksBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      editorBlocks(flat: true) {
        name
        clientId
        parentClientId
        renderedHtml
      }
    }
  }
`;

const caseStudyBySlugQuery = `
  query GetCaseStudyBySlug($slug: ID!) {
    caseStudy(id: $slug, idType: SLUG) {
      id
      slug
      title
      excerpt
      ${featuredImageFields}
      editorBlocks(flat: true) {
        name
        clientId
        parentClientId
        renderedHtml
      }
    }
  }
`;

const caseStudyShellBySlugQuery = `
  query GetCaseStudyShellBySlug($slug: ID!) {
    caseStudy(id: $slug, idType: SLUG) {
      id
      slug
      title
      excerpt
      ${featuredImageFields}
    }
  }
`;

const caseStudyBlocksBySlugQuery = `
  query GetCaseStudyBlocksBySlug($slug: ID!) {
    caseStudy(id: $slug, idType: SLUG) {
      id
      editorBlocks(flat: true) {
        name
        clientId
        parentClientId
        renderedHtml
      }
    }
  }
`;

async function wordpressFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const endpoint = getWordPressGraphqlEndpoint();

  if (!endpoint) {
    throw new Error('WordPress GraphQL endpoint is not available.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`WordPress request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as T & {
    errors?: Array<{ message?: string }>;
  };

  if (payload.errors?.length) {
    const message = payload.errors
      .map((error) => error.message)
      .filter(Boolean)
      .join('; ');

    throw new Error(`WordPress GraphQL request failed: ${message}`);
  }

  return payload;
}

function getWordPressGraphqlEndpoint() {
  const config = useRuntimeConfig();
  const useQaCms = shouldUseQaCms(config);

  if (import.meta.server) {
    return useQaCms
      ? String(config.qaWordpressGraphqlUrl ?? config.devWordpressGraphqlUrl ?? '')
      : String(config.wordpressGraphqlUrl ?? '');
  }

  return useQaCms
    ? String(
        config.public.qaWordpressGraphqlUrl ??
          config.public.devWordpressGraphqlUrl ??
          '',
      )
    : String(config.public.wordpressGraphqlUrl ?? '');
}

function shouldUseQaCms(config: ReturnType<typeof useRuntimeConfig>) {
  const staticCmsEnvironment = String(
    config.staticCmsEnvironment ?? config.public.staticCmsEnvironment ?? '',
  );

  if (staticCmsEnvironment === 'qa' || staticCmsEnvironment === 'dev') {
    return true;
  }

  if (staticCmsEnvironment === 'public' || staticCmsEnvironment === 'content') {
    return false;
  }

  if (import.meta.server) {
    return isQaFrontendHost(useRequestHeader('host') ?? '');
  }

  if (import.meta.client) {
    return isQaFrontendHost(window.location.host);
  }

  return false;
}

function isQaFrontendHost(host: string) {
  const hostname = host.split(':')[0]?.toLowerCase() ?? '';

  return (
    hostname === 'qa.my-website.localhost' ||
    hostname.startsWith('qa.') ||
    hostname === 'dev.my-website.localhost' ||
    hostname.startsWith('dev.')
  );
}

function normalizePost(post: WordPressPost): WordPressPost {
  return {
    ...post,
    date: new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    title: stripHtml(post.title),
    excerpt: stripHtml(post.excerpt),
    authorName: stripHtml(post.author?.node?.name ?? ''),
    featuredMedia: post.featuredImage?.node ?? null,
  };
}

function normalizeBlocks(blocks: GutenbergBlock[] = []) {
  return blocks.map((block) => ({
    ...block,
    attributes: parseBlockAttributes(block.attributesJSON),
  }));
}

function parseBlockAttributes(attributesJSON?: string | null) {
  if (!attributesJSON) {
    return {};
  }

  try {
    return JSON.parse(attributesJSON) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, '').trim();
}

function normalizeLinks(links: SiteLink[] = []) {
  return links.filter((link) => link.label?.trim() && link.url?.trim());
}

function fallbackPageInfo(): WordPressPageInfo {
  return {
    hasNextPage: false,
    endCursor: null,
  };
}

function normalizeTestimonials(
  testimonials: WordPressEmployerTestimonial[] = [],
): EmployerTestimonial[] {
  return testimonials
    .map((testimonial) => ({
      quote: stripHtml(testimonial.quote ?? ''),
      name: stripHtml(testimonial.name ?? ''),
      role: stripHtml(testimonial.role ?? ''),
      organization: stripHtml(testimonial.organization ?? ''),
    }))
    .filter(
      (testimonial) =>
        testimonial.quote ||
        testimonial.name ||
        testimonial.role ||
        testimonial.organization,
    );
}

function normalizeCaseStudy(caseStudy: WordPressCaseStudy): WordPressCaseStudy {
  return {
    ...caseStudy,
    title: stripHtml(caseStudy.title),
    excerpt: stripHtml(caseStudy.excerpt),
    featuredMedia: caseStudy.featuredImage?.node ?? null,
  };
}

export async function queryHomePageContent(): Promise<HomePageContent> {
  const response =
    await wordpressFetch<WordPressHomePageResponse>(homePageQuery);
  const megaText = stripHtml(response.data.nodeByUri?.megaText ?? '');
  const homeTitle = stripHtml(response.data.nodeByUri?.heroTitle ?? '');
  const homeSubtitle = stripHtml(response.data.nodeByUri?.heroSubtitle ?? '');
  const aboutTagline = stripHtml(response.data.nodeByUri?.aboutTagline ?? '');
  const quickLinks = normalizeLinks(
    response.data.nodeByUri?.homepageQuickLinks ?? [],
  );
  const employerTestimonials = normalizeTestimonials(
    response.data.nodeByUri?.homepageEmployerTestimonials ?? [],
  );

  return {
    megaText: megaText || 'B.L.U.F.',
    title: homeTitle || 'Title Text',
    subtitle: homeSubtitle || 'Subtitle text',
    aboutTagline:
      aboutTagline ||
      'This is the website of Aslan French, design technologist and researcher.',
    quickLinks: quickLinks.length
      ? quickLinks
      : [
          { label: 'Resume', url: '#' },
          { label: 'GitHub', url: 'https://github.com/jcklpe' },
          { label: 'LinkedIn', url: '#' },
          { label: 'Schedule a call', url: '#' },
        ],
    employerTestimonials: employerTestimonials.length
      ? employerTestimonials
      : fallbackEmployerTestimonials,
  };
}

export async function queryFooterSettings(): Promise<FooterSettings> {
  const response =
    await wordpressFetch<WordPressFooterSettingsResponse>(footerSettingsQuery);
  const footerSettings = response.data.footerSettings;
  const heading = stripHtml(footerSettings?.heading ?? '');
  const body = stripHtml(footerSettings?.body ?? '');
  const note = stripHtml(footerSettings?.note ?? '');
  const links = normalizeLinks(footerSettings?.links ?? []);

  return {
    heading: heading || 'Bottom line, still up front.',
    body:
      body ||
      'A small footer for global links, contact paths, and project context.',
    links: links.length
      ? links
      : [
          { label: 'About', url: '/about' },
          { label: 'Writing', url: '/writing' },
          { label: 'Case Studies', url: '/#selected-work' },
          { label: 'Side Projects', url: '/side-projects' },
        ],
    note: note || '',
  };
}

export async function queryWordPressPostsPage(
  first = 12,
  after?: string | null,
): Promise<WordPressPostsPage> {
  const response = await wordpressFetch<WordPressPostsResponse>(postsQuery, {
    first,
    after,
  });

  return {
    posts: response.data.posts.nodes.map(normalizePost),
    pageInfo: response.data.posts.pageInfo ?? fallbackPageInfo(),
  };
}

export async function queryAllWordPressPostsPage(
  pageSize = 100,
  maxPages = 20,
): Promise<WordPressPostsPage> {
  const posts: WordPressPost[] = [];
  let pageInfo = fallbackPageInfo();
  let after: string | null | undefined = null;

  for (let page = 0; page < maxPages; page++) {
    const postsPage = await queryWordPressPostsPage(pageSize, after);
    posts.push(...postsPage.posts);
    pageInfo = postsPage.pageInfo;

    if (!pageInfo.hasNextPage) {
      return {
        posts,
        pageInfo,
      };
    }

    after = pageInfo.endCursor;
  }

  return {
    posts,
    pageInfo,
  };
}

export async function queryWordPressPosts(first = 12) {
  const postsPage = await queryWordPressPostsPage(first);

  return postsPage.posts;
}

export async function queryWordPressCaseStudies(first = 12) {
  const response = await wordpressFetch<WordPressCaseStudiesResponse>(
    caseStudiesQuery,
    {
      first,
    },
  );

  return response.data.caseStudies.nodes.map(normalizeCaseStudy);
}

export async function queryWordPressPostBySlug(slug: string) {
  const response = await wordpressFetch<WordPressSinglePostResponse>(
    postBySlugQuery,
    { slug },
  );

  if (!response.data.post) {
    return null;
  }

  return {
    ...normalizePost(response.data.post),
    blocks: normalizeBlocks(
      (
        response.data.post as WordPressPost & {
          editorBlocks?: GutenbergBlock[];
        }
      ).editorBlocks ?? [],
    ),
  };
}

export async function queryWordPressPostShellBySlug(slug: string) {
  const response = await wordpressFetch<WordPressSinglePostResponse>(
    postShellBySlugQuery,
    { slug },
  );

  if (!response.data.post) {
    return null;
  }

  return {
    ...normalizePost(response.data.post),
    blocks: [],
  };
}

export async function queryWordPressPostBlocksBySlug(slug: string) {
  const response = await wordpressFetch<WordPressSinglePostResponse>(
    postBlocksBySlugQuery,
    { slug },
  );

  if (!response.data.post) {
    return null;
  }

  return normalizeBlocks(
    (
      response.data.post as WordPressPost & {
        editorBlocks?: GutenbergBlock[];
      }
    ).editorBlocks ?? [],
  );
}

export async function queryWordPressCaseStudyBySlug(slug: string) {
  const response = await wordpressFetch<WordPressSingleCaseStudyResponse>(
    caseStudyBySlugQuery,
    { slug },
  );

  if (!response.data.caseStudy) {
    return null;
  }

  return {
    ...normalizeCaseStudy(response.data.caseStudy),
    blocks: normalizeBlocks(
      (
        response.data.caseStudy as WordPressCaseStudy & {
          editorBlocks?: GutenbergBlock[];
        }
      ).editorBlocks ?? [],
    ),
  };
}

export async function queryWordPressCaseStudyShellBySlug(slug: string) {
  const response = await wordpressFetch<WordPressSingleCaseStudyResponse>(
    caseStudyShellBySlugQuery,
    { slug },
  );

  if (!response.data.caseStudy) {
    return null;
  }

  return {
    ...normalizeCaseStudy(response.data.caseStudy),
    blocks: [],
  };
}

export async function queryWordPressCaseStudyBlocksBySlug(slug: string) {
  const response = await wordpressFetch<WordPressSingleCaseStudyResponse>(
    caseStudyBlocksBySlugQuery,
    { slug },
  );

  if (!response.data.caseStudy) {
    return null;
  }

  return normalizeBlocks(
    (
      response.data.caseStudy as WordPressCaseStudy & {
        editorBlocks?: GutenbergBlock[];
      }
    ).editorBlocks ?? [],
  );
}
