type SeoValue = string | null | undefined;
type SeoSource = SeoValue | (() => SeoValue);
type OpenGraphType = 'website' | 'article';
type OpenGraphTypeSource =
  | OpenGraphType
  | null
  | undefined
  | (() => OpenGraphType | null | undefined);

interface SiteSeoMetaOptions {
  title: SeoSource;
  description?: SeoSource;
  type?: OpenGraphTypeSource;
  image?: SeoSource;
  imageAlt?: SeoSource;
  canonical?: SeoSource;
}

const siteName = 'Aslan French';
const defaultSocialImage = '/images/social-card-default.png';
const defaultSocialImageAlt =
  'Aslan French — design technologist, researcher, and creative practitioner.';
const fallbackDescription =
  'Page description fallback — add a route-specific SEO description in WordPress.';

export function useSiteSeoMeta(options: SiteSeoMetaOptions) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const siteUrl = () => cleanSiteUrl(config.public.siteUrl as string);
  const title = () => cleanSeoValue(options.title, siteName);
  const description = () =>
    cleanSeoValue(options.description, fallbackDescription);
  const suppliedImage = () => cleanSeoValue(options.image);
  const image = () =>
    absoluteUrl(suppliedImage() || defaultSocialImage, siteUrl());
  const imageAlt = () =>
    cleanSeoValue(
      options.imageAlt,
      suppliedImage() ? '' : defaultSocialImageAlt,
    );
  const type = () => cleanOpenGraphType(options.type);
  const pageUrl = () => absoluteUrl(route.path, siteUrl());
  const canonicalUrl = () =>
    absoluteUrl(cleanSeoValue(options.canonical), siteUrl()) || pageUrl();
  const robots = () => {
    const isDevRoute = route.path.startsWith('/dev/');
    const isNonProductionStaticBuild =
      config.public.staticGenerated &&
      config.public.staticDeployEnvironment !== 'production';

    return isDevRoute || isNonProductionStaticBuild
      ? 'noindex, nofollow'
      : undefined;
  };
  const twitterCard = () =>
    (image() ? 'summary_large_image' : 'summary') as
      | 'summary'
      | 'summary_large_image';

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: pageUrl,
    ogImage: () => image() || undefined,
    ogImageAlt: () => imageAlt() || undefined,
    ogSiteName: siteName,
    ogType: type,
    twitterCard,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: () => image() || undefined,
    twitterImageAlt: () => imageAlt() || undefined,
    robots,
  });

  useHead({
    link: computed(() => [{ rel: 'canonical', href: canonicalUrl() }]),
  });
}

function cleanSeoValue(source?: SeoSource, fallback = '') {
  const value = typeof source === 'function' ? source() : source;
  const cleanedValue = String(value ?? '').trim();

  return cleanedValue || fallback;
}

function cleanOpenGraphType(source?: OpenGraphTypeSource): OpenGraphType {
  const value = typeof source === 'function' ? source() : source;

  return value ?? 'website';
}

function cleanSiteUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function absoluteUrl(value: string, siteUrl: string) {
  if (!value) {
    return '';
  }

  try {
    return new URL(value, `${siteUrl}/`).href;
  } catch {
    return value;
  }
}
