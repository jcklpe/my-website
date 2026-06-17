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
  WordPressPageSeoResponse,
  WordPressPageInfo,
  WordPressPage,
  WordPressPageByUriResponse,
  WordPressPageRoute,
  WordPressPageRoutesResponse,
  WordPressPost,
  WordPressPostsPage,
  WordPressPostsResponse,
  WordPressSingleCaseStudyResponse,
  WordPressSinglePostResponse,
  WordPressSlugRoute,
  WordPressSlugRoutesResponse,
} from '~/types/wordpress';
import { decodeHtmlEntities } from '~/utils/block-html';

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
        selectedWorkLayout
        selectedWorkTextAlign
        selectedWorkPhotoTreatment
        ${featuredImageFields}
      }
    }
  }
`;

const homePageQuery = `
  query GetHomePageContent {
    nodeByUri(uri: "/") {
      ... on Page {
        aboutTagline
        seoDescription
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

const pageByUriQuery = `
  query GetPageByUri($uri: ID!, $slug: String!) {
    page(id: $uri, idType: URI) {
      id
      databaseId
      slug
      uri
      title
      displayHeading
      seoDescription
      editorBlocks(flat: true) {
        name
        clientId
        parentClientId
        renderedHtml
      }
    }
    pages(where: { name: $slug }) {
      nodes {
        id
        databaseId
        slug
        uri
        title
        displayHeading
        seoDescription
        editorBlocks(flat: true) {
          name
          clientId
          parentClientId
          renderedHtml
        }
      }
    }
  }
`;

const pageRoutesQuery = `
  query GetPageRoutes {
    pages(first: 100) {
      nodes {
        databaseId
        slug
        uri
        status
      }
    }
  }
`;

const postRoutesQuery = `
  query GetPostRoutes($after: String) {
    posts(first: 100, after: $after) {
      nodes {
        slug
        status
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const caseStudyRoutesQuery = `
  query GetCaseStudyRoutes($after: String) {
    caseStudies(first: 100, after: $after) {
      nodes {
        slug
        status
      }
      pageInfo {
        hasNextPage
        endCursor
      }
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
      canonicalUrl
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
      canonicalUrl
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

  return wordpressFetchFromEndpoint(endpoint, query, variables);
}

async function wordpressFetchFromEndpoint<T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
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

async function wordpressFetchWithBlockOptions<T>(
  query: string,
  variables?: Record<string, unknown>,
) {
  const endpoint = getWordPressGraphqlEndpoint();
  const blockOptions = createBlockNormalizeOptions();
  const [response, contentRoutes] = await Promise.all([
    wordpressFetchFromEndpoint<T>(endpoint, query, variables),
    queryWordPressContentRoutes(endpoint),
  ]);

  blockOptions.contentRoutesBySlug = contentRoutes.contentRoutesBySlug;
  blockOptions.pageRoutesById = contentRoutes.pageRoutesById;

  return {
    response,
    blockOptions,
  };
}

function getWordPressGraphqlEndpoint() {
  const config = useRuntimeConfig();
  const useQaCms = shouldUseQaCms(config);

  if (import.meta.server) {
    return useQaCms
      ? String(
          config.qaWordpressGraphqlUrl ?? config.devWordpressGraphqlUrl ?? '',
        )
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

function withoutEditorBlocks<T extends { editorBlocks?: GutenbergBlock[] }>(
  value: T,
) {
  const clone = { ...value };
  delete clone.editorBlocks;

  return clone;
}

function normalizePost(post: WordPressPost): WordPressPost {
  return {
    ...withoutEditorBlocks(post),
    date: new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    title: stripHtml(post.title),
    excerpt: stripHtml(post.excerpt),
    authorName: stripHtml(post.author?.node?.name ?? ''),
    featuredMedia: post.featuredImage?.node ?? null,
    canonicalUrl: post.canonicalUrl ?? null,
  };
}

interface BlockNormalizeOptions {
  contentRoutesBySlug: Map<string, string>;
  internalLinkOrigins: Set<string>;
  pageRoutesById: Map<number, string>;
}

interface WordPressContentRoutes {
  contentRoutesBySlug: Map<string, string>;
  pageRoutesById: Map<number, string>;
}

const contentRoutesCache = new Map<string, Promise<WordPressContentRoutes>>();

function normalizeBlocks(
  blocks: GutenbergBlock[] = [],
  options = defaultBlockNormalizeOptions(),
) {
  return blocks.map((block) => ({
    ...block,
    attributes: parseBlockAttributes(block.attributesJSON),
    renderedHtml: normalizeRenderedHtmlLinks(block.renderedHtml, options),
  }));
}

function createBlockNormalizeOptions(): BlockNormalizeOptions {
  return {
    contentRoutesBySlug: new Map(),
    internalLinkOrigins: getInternalContentLinkOrigins(),
    pageRoutesById: new Map(),
  };
}

function defaultBlockNormalizeOptions(): BlockNormalizeOptions {
  return {
    contentRoutesBySlug: new Map(),
    internalLinkOrigins: new Set(),
    pageRoutesById: new Map(),
  };
}

function normalizeRenderedHtmlLinks(
  html: string | null | undefined,
  options: BlockNormalizeOptions,
) {
  if (!html) {
    return html;
  }

  return html.replace(
    /\bhref=(["'])(.*?)\1/gi,
    (attribute, quote: string, rawHref: string) => {
      const normalizedHref = normalizeRenderedHref(rawHref, options);

      if (normalizedHref === rawHref) {
        return attribute;
      }

      return `href=${quote}${encodeHtmlAttribute(normalizedHref)}${quote}`;
    },
  );
}

function normalizeRenderedHref(
  rawHref: string,
  options: BlockNormalizeOptions,
) {
  const href = decodeHtmlEntities(rawHref.trim());

  if (!href || href.startsWith('#')) {
    return rawHref;
  }

  const relativeContentRoute = getContentRouteFromRelativeHref(href, options);

  if (relativeContentRoute) {
    return relativeContentRoute;
  }

  let url: URL;

  try {
    url = new URL(href);
  } catch {
    return rawHref;
  }

  if (!options.internalLinkOrigins.has(url.origin)) {
    return rawHref;
  }

  if (isWordPressRuntimePath(url.pathname)) {
    return rawHref;
  }

  const pageIdRoute = getPageIdRoute(url, options.pageRoutesById);

  if (pageIdRoute) {
    return `${pageIdRoute}${url.hash}`;
  }

  const contentRoute = getContentRouteFromPathname(url.pathname, options);

  if (contentRoute) {
    return `${contentRoute}${url.search}${url.hash}`;
  }

  if (url.pathname === '/' && url.searchParams.has('page_id')) {
    return rawHref;
  }

  return `${url.pathname}${url.search}${url.hash}` || '/';
}

function getContentRouteFromRelativeHref(
  href: string,
  options: BlockNormalizeOptions,
) {
  if (!href.startsWith('/') || href.startsWith('//')) {
    return '';
  }

  let url: URL;

  try {
    url = new URL(href, 'http://local-content.invalid');
  } catch {
    return '';
  }

  const contentRoute = getContentRouteFromPathname(url.pathname, options);

  if (!contentRoute) {
    return '';
  }

  return `${contentRoute}${url.search}${url.hash}`;
}

function getContentRouteFromPathname(
  pathname: string,
  options: BlockNormalizeOptions,
) {
  const slug = getSlugFromPathname(pathname);

  if (!slug) {
    return '';
  }

  return options.contentRoutesBySlug.get(slug) ?? '';
}

function getSlugFromPathname(pathname: string) {
  const slug = pathname
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean)
    .at(-1);

  if (!slug) {
    return '';
  }

  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function getPageIdRoute(url: URL, pageRoutesById: Map<number, string>) {
  if (url.pathname !== '/') {
    return '';
  }

  const pageId = Number(url.searchParams.get('page_id'));

  if (!Number.isFinite(pageId)) {
    return '';
  }

  return pageRoutesById.get(pageId) ?? '';
}

async function queryWordPressPageRoutes(endpoint: string) {
  const response =
    await wordpressFetchFromEndpoint<WordPressPageRoutesResponse>(
      endpoint,
      pageRoutesQuery,
    );

  return buildFrontendPageRoutes(response.data.pages?.nodes ?? []);
}

async function queryWordPressContentRoutes(endpoint: string) {
  const cachedRoutes = contentRoutesCache.get(endpoint);

  if (cachedRoutes) {
    return cachedRoutes;
  }

  const routesPromise = loadWordPressContentRoutes(endpoint);
  contentRoutesCache.set(endpoint, routesPromise);

  return routesPromise;
}

async function loadWordPressContentRoutes(
  endpoint: string,
): Promise<WordPressContentRoutes> {
  const [pageRoutesById, postRoutes, caseStudyRoutes] = await Promise.all([
    queryWordPressPageRoutes(endpoint),
    queryWordPressSlugRoutes(endpoint, postRoutesQuery, 'posts'),
    queryWordPressSlugRoutes(endpoint, caseStudyRoutesQuery, 'caseStudies'),
  ]);

  return {
    contentRoutesBySlug: buildContentRoutesBySlug({
      caseStudyRoutes,
      postRoutes,
    }),
    pageRoutesById,
  };
}

async function queryWordPressSlugRoutes(
  endpoint: string,
  routeQuery: string,
  fieldName: string,
): Promise<WordPressSlugRoute[]> {
  const routes: WordPressSlugRoute[] = [];
  let after: string | null | undefined = null;

  for (let page = 0; page < 20; page++) {
    const response: WordPressSlugRoutesResponse =
      await wordpressFetchFromEndpoint<WordPressSlugRoutesResponse>(
        endpoint,
        routeQuery,
        { after },
      );
    const routePage: WordPressSlugRoutesResponse['data'][string] =
      response.data[fieldName];

    if (!routePage) {
      return routes;
    }

    routes.push(...(routePage.nodes ?? []));

    if (!routePage.pageInfo?.hasNextPage) {
      return routes;
    }

    after = routePage.pageInfo.endCursor;
  }

  return routes;
}

function buildContentRoutesBySlug({
  caseStudyRoutes,
  postRoutes,
}: {
  caseStudyRoutes: WordPressSlugRoute[];
  postRoutes: WordPressSlugRoute[];
}) {
  const routes = new Map<string, string>();

  addContentRoutes(routes, postRoutes, '/writing');
  addContentRoutes(routes, caseStudyRoutes, '/case-studies');

  return routes;
}

function addContentRoutes(
  routes: Map<string, string>,
  contentRoutes: WordPressSlugRoute[],
  routePrefix: string,
) {
  for (const route of contentRoutes) {
    const slug = route.slug?.trim().replace(/^\/+|\/+$/g, '');

    if (!slug || routes.has(slug)) {
      continue;
    }

    routes.set(slug, `${routePrefix}/${slug}`);
  }
}

function buildFrontendPageRoutes(pages: WordPressPageRoute[]) {
  const routes = new Map<number, string>();

  for (const page of pages) {
    const databaseId = Number(page.databaseId);
    const route = getFrontendPageRoute(page);

    if (!Number.isFinite(databaseId) || !route) {
      continue;
    }

    routes.set(databaseId, route);
  }

  return routes;
}

function getFrontendPageRoute(page: WordPressPageRoute) {
  const slug = page.slug?.trim();

  if (page.uri === '/' || slug === 'home') {
    return '/';
  }

  if (!slug) {
    return '';
  }

  return `/${slug.replace(/^\/+|\/+$/g, '')}`;
}

function getPageSlugFromUri(uri: string) {
  const slug = uri
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean)
    .at(-1);

  return slug || 'home';
}

function getInternalContentLinkOrigins() {
  const config = useRuntimeConfig();
  const origins = new Set<string>();

  if (import.meta.server) {
    addDefaultInternalContentLinkOrigins(origins);
  }

  addUrlOrigin(origins, String(config.wordpressGraphqlUrl ?? ''));
  addUrlOrigin(origins, String(config.qaWordpressGraphqlUrl ?? ''));
  addUrlOrigin(origins, String(config.devWordpressGraphqlUrl ?? ''));
  addUrlOrigin(origins, String(config.public.wordpressGraphqlUrl ?? ''));
  addUrlOrigin(origins, String(config.public.qaWordpressGraphqlUrl ?? ''));
  addUrlOrigin(origins, String(config.public.devWordpressGraphqlUrl ?? ''));

  return origins;
}

function addDefaultInternalContentLinkOrigins(origins: Set<string>) {
  const localCmsHosts = [
    'cms.my-website.localhost',
    'qa.cms.my-website.localhost',
    'dev.cms.my-website.localhost',
  ];

  for (const host of localCmsHosts) {
    addUrlOrigin(origins, `http://${host}`);
    addUrlOrigin(origins, `https://${host}`);
  }

  addUrlOrigin(origins, 'http://127.0.0.1:8080');
  addUrlOrigin(origins, 'http://127.0.0.1:8081');
}

function addUrlOrigin(origins: Set<string>, value: string) {
  if (!value) {
    return;
  }

  try {
    origins.add(new URL(value).origin);
  } catch {
    // Ignore unset or relative environment values.
  }
}

function isWordPressRuntimePath(pathname: string) {
  return (
    pathname.startsWith('/wp-admin') ||
    pathname.startsWith('/wp-content/uploads/') ||
    pathname.startsWith('/wp-json') ||
    pathname === '/graphql' ||
    pathname === '/wp-login.php'
  );
}

function encodeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
    ...withoutEditorBlocks(caseStudy),
    title: stripHtml(caseStudy.title),
    excerpt: stripHtml(caseStudy.excerpt),
    featuredMedia: caseStudy.featuredImage?.node ?? null,
  };
}

function normalizePage(
  page: WordPressPage,
  blockOptions: BlockNormalizeOptions,
): WordPressPage {
  return {
    ...withoutEditorBlocks(page),
    title: stripHtml(page.title),
    displayHeading: stripHtml(page.displayHeading ?? ''),
    seoDescription: stripHtml(page.seoDescription ?? ''),
    blocks: normalizeBlocks(page.editorBlocks ?? [], blockOptions),
  };
}

export async function queryHomePageContent(): Promise<HomePageContent> {
  const response =
    await wordpressFetch<WordPressHomePageResponse>(homePageQuery);
  const aboutTagline = stripHtml(response.data.nodeByUri?.aboutTagline ?? '');
  const seoDescription = stripHtml(
    response.data.nodeByUri?.seoDescription ?? '',
  );
  const quickLinks = normalizeLinks(
    response.data.nodeByUri?.homepageQuickLinks ?? [],
  );
  const employerTestimonials = normalizeTestimonials(
    response.data.nodeByUri?.homepageEmployerTestimonials ?? [],
  );

  return {
    aboutTagline:
      aboutTagline ||
      'This is the website of Aslan French, design technologist and researcher.',
    quickLinks: quickLinks.length
      ? quickLinks
      : [
          { label: 'Important Link 1', url: '#' },
          { label: 'Important Link 2', url: '#' },
          { label: 'Important Link 3', url: '#' },
          { label: 'Important Link 4', url: '#' },
        ],
    employerTestimonials,
    seoDescription:
      seoDescription ||
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  };
}

export async function queryPageSeoDescription(uri: string): Promise<string> {
  const query = `
    query GetPageSeoDescription($uri: ID!) {
      nodeByUri(uri: $uri) {
        ... on Page {
          seoDescription
        }
      }
    }
  `;
  const response = await wordpressFetch<WordPressPageSeoResponse>(query, {
    uri,
  });
  const value = stripHtml(response.data.nodeByUri?.seoDescription ?? '');
  return value || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
}

export async function queryWordPressPageByUri(uri: string) {
  const { response, blockOptions } =
    await wordpressFetchWithBlockOptions<WordPressPageByUriResponse>(
      pageByUriQuery,
      {
        uri,
        slug: getPageSlugFromUri(uri),
      },
    );

  const page = response.data.page ?? response.data.pages?.nodes.at(0) ?? null;

  if (!page) {
    return null;
  }

  return normalizePage(page, blockOptions);
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
  const { response, blockOptions } =
    await wordpressFetchWithBlockOptions<WordPressSinglePostResponse>(
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
      blockOptions,
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
  const { response, blockOptions } =
    await wordpressFetchWithBlockOptions<WordPressSinglePostResponse>(
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
    blockOptions,
  );
}

export async function queryWordPressCaseStudyBySlug(slug: string) {
  const { response, blockOptions } =
    await wordpressFetchWithBlockOptions<WordPressSingleCaseStudyResponse>(
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
      blockOptions,
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
  const { response, blockOptions } =
    await wordpressFetchWithBlockOptions<WordPressSingleCaseStudyResponse>(
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
    blockOptions,
  );
}
