export interface GutenbergBlock {
  name: string
  clientId: string
  parentClientId: string | null
  renderedHtml?: string | null
  attributesJSON?: string | null
  attributes?: Record<string, unknown>
}

export interface WordPressPost {
  id: string
  slug: string
  date: string
  title: string
  excerpt: string
  content?: string
  blocks: GutenbergBlock[]
  editorBlocks?: GutenbergBlock[]
}

export interface HomePageContent {
  title: string
  subtitle: string
}

export interface WordPressPostsResponse {
  data: {
    posts: {
      nodes: WordPressPost[]
    }
  }
}

export interface WordPressSinglePostResponse {
  data: {
    post: WordPressPost | null
  }
}

export interface WordPressHomePageResponse {
  data: {
    nodeByUri?: {
      heroTitle?: string | null
      heroSubtitle?: string | null
    } | null
  }
}
