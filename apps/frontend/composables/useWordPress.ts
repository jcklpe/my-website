import type {
  GutenbergBlock,
  HomePageContent,
  WordPressHomePageResponse,
  WordPressPost,
  WordPressPostsResponse,
  WordPressSinglePostResponse,
} from '~/types/wordpress'

const postsQuery = `
  query GetPosts {
    posts(first: 12) {
      nodes {
        id
        slug
        date
        title
        excerpt
      }
    }
  }
`

const homePageQuery = `
  query GetHomePageContent {
    generalSettings {
      title
      description
    }
    nodeByUri(uri: "/home/") {
      ... on Page {
        title
        content
      }
    }
  }
`

const postBySlugQuery = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      slug
      date
      title
      excerpt
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

export async function queryHomePageContent(): Promise<HomePageContent> {
  const response = await wordpressFetch<WordPressHomePageResponse>(homePageQuery)
  const siteTitle = stripHtml(response.data.generalSettings?.title ?? '')
  const siteDescription = stripHtml(response.data.generalSettings?.description ?? '')
  const homeTitle = stripHtml(response.data.nodeByUri?.title ?? '')
  const homeIntro = stripHtml(response.data.nodeByUri?.content ?? '')

  return {
    eyebrow: siteTitle || 'My Website',
    title: homeTitle || 'Portfolio foundation, ready for your design work.',
    intro:
      homeIntro
      || siteDescription
      || 'The frontend is SSR-first, block-aware, and set up so styling can stay in your hands while content modeling and data plumbing stay predictable.',
  }
}

export async function queryWordPressPosts() {
  const response = await wordpressFetch<WordPressPostsResponse>(postsQuery)

  return response.data.posts.nodes.map(normalizePost)
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
