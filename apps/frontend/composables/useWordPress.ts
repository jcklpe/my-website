import type {
  FooterSettings,
  GutenbergBlock,
  HomePageContent,
  SiteLink,
  WordPressCaseStudiesResponse,
  WordPressCaseStudy,
  WordPressFooterSettingsResponse,
  WordPressHomePageResponse,
  WordPressPost,
  WordPressPostsResponse,
  WordPressSingleCaseStudyResponse,
  WordPressSinglePostResponse,
} from '~/types/wordpress'

const featuredImageFields = `
  featuredImage {
    node {
      id
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
  }
`

const postsQuery = `
  query GetPosts {
    posts(first: 12) {
      nodes {
        id
        slug
        date
        title
        excerpt
        ${featuredImageFields}
      }
    }
  }
`

const caseStudiesQuery = `
  query GetCaseStudies {
    caseStudies(first: 12) {
      nodes {
        id
        slug
        title
        excerpt
        ${featuredImageFields}
      }
    }
  }
`

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
      }
    }
  }
`

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
`

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
`

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
`

async function wordpressFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const config = useRuntimeConfig()
  const response = await fetch(config.public.wordpressGraphqlUrl as string, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok) {
    throw new Error(`WordPress request failed with status ${response.status}`)
  }

  return (await response.json()) as T
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
  }
}

function normalizeBlocks(blocks: GutenbergBlock[] = []) {
  return blocks.map(block => ({
    ...block,
    attributes: block.attributesJSON ? JSON.parse(block.attributesJSON) : {},
  }))
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, '').trim()
}

function normalizeLinks(links: SiteLink[] = []) {
  return links.filter(link => link.label?.trim() && link.url?.trim())
}

function normalizeCaseStudy(caseStudy: WordPressCaseStudy): WordPressCaseStudy {
  return {
    ...caseStudy,
    title: stripHtml(caseStudy.title),
    excerpt: stripHtml(caseStudy.excerpt),
    featuredMedia: caseStudy.featuredImage?.node ?? null,
  }
}

export async function queryHomePageContent(): Promise<HomePageContent> {
  const response = await wordpressFetch<WordPressHomePageResponse>(homePageQuery)
  const megaText = stripHtml(response.data.nodeByUri?.megaText ?? '')
  const homeTitle = stripHtml(response.data.nodeByUri?.heroTitle ?? '')
  const homeSubtitle = stripHtml(response.data.nodeByUri?.heroSubtitle ?? '')
  const aboutTagline = stripHtml(response.data.nodeByUri?.aboutTagline ?? '')
  const quickLinks = normalizeLinks(response.data.nodeByUri?.homepageQuickLinks ?? [])

  return {
    megaText: megaText || 'B.L.U.F.',
    title: homeTitle || 'Title Text',
    subtitle:
      homeSubtitle
      || 'Subtitle text',
    aboutTagline:
      aboutTagline
      || 'This is the website of Aslan French, design technologist and researcher.',
    quickLinks: quickLinks.length
      ? quickLinks
      : [
          { label: 'Resume', url: '#' },
          { label: 'GitHub', url: 'https://github.com/jcklpe' },
          { label: 'LinkedIn', url: '#' },
          { label: 'Schedule a call', url: '#' },
        ],
  }
}

export async function queryFooterSettings(): Promise<FooterSettings> {
  const response = await wordpressFetch<WordPressFooterSettingsResponse>(footerSettingsQuery)
  const footerSettings = response.data.footerSettings
  const heading = stripHtml(footerSettings?.heading ?? '')
  const body = stripHtml(footerSettings?.body ?? '')
  const note = stripHtml(footerSettings?.note ?? '')
  const links = normalizeLinks(footerSettings?.links ?? [])

  return {
    heading: heading || 'Bottom line, still up front.',
    body: body || 'A small footer for global links, contact paths, and project context.',
    links: links.length
      ? links
      : [
          { label: 'Writing', url: '/writing' },
          { label: 'Case Studies', url: '/case-studies' },
          { label: 'Side Projects', url: '/side-projects' },
        ],
    note: note || 'Built with Nuxt and headless WordPress.',
  }
}

export async function queryWordPressPosts() {
  const response = await wordpressFetch<WordPressPostsResponse>(postsQuery)

  return response.data.posts.nodes.map(normalizePost)
}

export async function queryWordPressCaseStudies() {
  const response = await wordpressFetch<WordPressCaseStudiesResponse>(caseStudiesQuery)

  return response.data.caseStudies.nodes.map(normalizeCaseStudy)
}

export async function queryWordPressPostBySlug(slug: string) {
  const response = await wordpressFetch<WordPressSinglePostResponse>(
    postBySlugQuery,
    { slug },
  )

  if (!response.data.post) {
    return null
  }

  return {
    ...normalizePost(response.data.post),
    blocks: normalizeBlocks((response.data.post as WordPressPost & { editorBlocks?: GutenbergBlock[] }).editorBlocks ?? []),
  }
}

export async function queryWordPressCaseStudyBySlug(slug: string) {
  const response = await wordpressFetch<WordPressSingleCaseStudyResponse>(
    caseStudyBySlugQuery,
    { slug },
  )

  if (!response.data.caseStudy) {
    return null
  }

  return {
    ...normalizeCaseStudy(response.data.caseStudy),
    blocks: normalizeBlocks((response.data.caseStudy as WordPressCaseStudy & { editorBlocks?: GutenbergBlock[] }).editorBlocks ?? []),
  }
}
