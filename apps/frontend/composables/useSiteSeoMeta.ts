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
const fallbackDescription =
  'Design technology, research, and web-shaped craft.';

export function useSiteSeoMeta(options: SiteSeoMetaOptions) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const siteUrl = () => cleanSiteUrl(config.public.siteUrl as string);
  const title = () => cleanSeoValue(options.title, 'My Website');
  const description = () =>
    cleanSeoValue(options.description, fallbackDescription);
  const image = () => absoluteUrl(cleanSeoValue(options.image), siteUrl());
  const imageAlt = () => cleanSeoValue(options.imageAlt);
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

  return String(value ?? fallback).trim();
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
