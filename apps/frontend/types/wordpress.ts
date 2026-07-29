export type FeaturedMediaTreatment = 'default' | 'case-study-halftone';

export interface GutenbergBlock {
  name: string;
  clientId: string;
  parentClientId: string | null;
  renderedHtml?: string | null;
  attributesJSON?: string | null;
  attributes?: Record<string, unknown>;
}

export interface FeaturedImage {
  id?: string;
  sourceUrl: string;
  srcSet?: string | null;
  sizes?: string | null;
  altText: string;
  treatment?: FeaturedMediaTreatment;
  mediaDetails?: {
    width?: number | null;
    height?: number | null;
    sizes?: WordPressMediaSize[] | null;
  } | null;
}

export interface WordPressMediaSize {
  name?: string | null;
  sourceUrl?: string | null;
  width?: number | string | null;
  height?: number | string | null;
  mimeType?: string | null;
  file?: string | null;
  fileSize?: number | null;
}

export interface WordPressAuthor {
  node?: {
    name?: string | null;
  } | null;
}

export interface WordPressPost {
  id: string;
  slug: string;
  date: string;
  author?: WordPressAuthor | null;
  authorName?: string;
  title: string;
  excerpt: string;
  featuredImage?: {
    node?: FeaturedImage | null;
  } | null;
  featuredMedia?: FeaturedImage | null;
  content?: string;
  blocks: GutenbergBlock[];
  editorBlocks?: GutenbergBlock[];
  canonicalUrl?: string | null;
}

export interface WordPressCaseStudy {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: {
    node?: FeaturedImage | null;
  } | null;
  featuredMedia?: FeaturedImage | null;
  blocks?: GutenbergBlock[];
  editorBlocks?: GutenbergBlock[];
  selectedWorkLayout?:
    | 'auto'
    | 'banner'
    | 'narrow_photo_left'
    | 'narrow_photo_right'
    | 'wide_photo_left'
    | 'wide_photo_right'
    | null;
  selectedWorkTextAlign?: 'auto' | 'left' | 'right' | null;
  selectedWorkPhotoTreatment?:
    | 'auto'
    | 'bleed_blue_cream'
    | 'direct_ink_blue'
    | 'direct_tritone'
    | 'direct_blue_cream'
    | 'crisp_ink_blue'
    | 'bleed_tritone'
    | null;
}

export interface WordPressPage {
  id: string;
  databaseId?: number | null;
  slug?: string | null;
  uri?: string | null;
  title: string;
  displayHeading?: string | null;
  displayDescription?: string | null;
  seoDescription?: string | null;
  nowContent?: string | null;
  blocks: GutenbergBlock[];
  editorBlocks?: GutenbergBlock[];
}

export interface WordPressPageRoute {
  databaseId?: number | null;
  slug?: string | null;
  uri?: string | null;
  status?: string | null;
}

export interface WordPressSlugRoute {
  slug?: string | null;
  status?: string | null;
}

export interface SiteLink {
  label: string;
  url: string;
}

export interface EmployerTestimonial {
  quote: string;
  name: string;
  role: string;
  organization: string;
}

export interface WordPressEmployerTestimonial {
  quote?: string | null;
  name?: string | null;
  role?: string | null;
  organization?: string | null;
}

export type TestimonialsTexture =
  | 'none'
  | 'dots'
  | 'paper_grid'
  | 'paper_grid_ink'
  | 'paper_grid_signal_dots'
  | 'blueprint'
  | 'scanline';

export interface HomePageContent {
  aboutTagline: string;
  quickLinks: SiteLink[];
  employerTestimonials: EmployerTestimonial[];
  testimonialsTexture: TestimonialsTexture;
  heroPortrait: string | null;
  heroPortraitAlt: string | null;
  seoDescription: string;
}

export interface FooterSettings {
  heading: string;
  body: string;
  links: SiteLink[];
  note: string;
}

export interface WordPressPostsResponse {
  data: {
    posts: {
      nodes: WordPressPost[];
      pageInfo: WordPressPageInfo;
    };
  };
}

export interface WordPressPageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
}

export interface WordPressPostsPage {
  posts: WordPressPost[];
  pageInfo: WordPressPageInfo;
}

export interface WordPressSinglePostResponse {
  data: {
    post: WordPressPost | null;
  };
}

export interface WordPressCaseStudiesResponse {
  data: {
    caseStudies: {
      nodes: WordPressCaseStudy[];
    };
  };
}

export interface WordPressSingleCaseStudyResponse {
  data: {
    caseStudy: WordPressCaseStudy | null;
  };
}

export interface WordPressHomePageResponse {
  data: {
    nodeByUri?: {
      aboutTagline?: string | null;
      homepageQuickLinks?: SiteLink[] | null;
      homepageEmployerTestimonials?: WordPressEmployerTestimonial[] | null;
      homepageTestimonialsTexture?: string | null;
      homepageHeroPortrait?: string | null;
      homepageHeroPortraitAlt?: string | null;
      seoDescription?: string | null;
    } | null;
  };
}

export interface WordPressPageSeoResponse {
  data: {
    nodeByUri?: {
      seoDescription?: string | null;
    } | null;
  };
}

export interface WordPressPageByUriResponse {
  data: {
    page?: WordPressPage | null;
    pages?: {
      nodes: WordPressPage[];
    };
  };
}

export interface WordPressPageRoutesResponse {
  data: {
    pages?: {
      nodes: WordPressPageRoute[];
    };
  };
}

export interface WordPressSlugRoutesResponse {
  data: Record<
    string,
    | {
        nodes?: WordPressSlugRoute[];
        pageInfo?: WordPressPageInfo | null;
      }
    | undefined
  >;
}

export interface WordPressFooterSettingsResponse {
  data: {
    footerSettings?: {
      heading?: string | null;
      body?: string | null;
      links?: SiteLink[] | null;
      note?: string | null;
    } | null;
  };
}
