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

export interface WordPressCaseStudy {
  id: string
  slug: string
  title: string
  excerpt: string
  blocks?: GutenbergBlock[]
  editorBlocks?: GutenbergBlock[]
}

export interface SiteLink {
  label: string
  url: string
}

export interface HomePageContent {
  megaText: string
  title: string
  subtitle: string
  aboutTagline: string
  quickLinks: SiteLink[]
}

export interface FooterSettings {
  heading: string
  body: string
  links: SiteLink[]
  note: string
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

export interface WordPressCaseStudiesResponse {
  data: {
    caseStudies: {
      nodes: WordPressCaseStudy[]
    }
  }
}

export interface WordPressSingleCaseStudyResponse {
  data: {
    caseStudy: WordPressCaseStudy | null
  }
}

export interface WordPressHomePageResponse {
  data: {
    nodeByUri?: {
      megaText?: string | null
      heroTitle?: string | null
      heroSubtitle?: string | null
      aboutTagline?: string | null
      homepageQuickLinks?: SiteLink[] | null
    } | null
  }
}

export interface WordPressFooterSettingsResponse {
  data: {
    footerSettings?: {
      heading?: string | null
      body?: string | null
      links?: SiteLink[] | null
      note?: string | null
    } | null
  }
}
