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
}

const siteName = 'Aslan French';
const fallbackDescription =
  'Design technology, research, and web-shaped craft.';

export function useSiteSeoMeta(options: SiteSeoMetaOptions) {
  const title = () => cleanSeoValue(options.title, 'My Website');
  const description = () =>
    cleanSeoValue(options.description, fallbackDescription);
  const image = () => cleanSeoValue(options.image);
  const imageAlt = () => cleanSeoValue(options.imageAlt);
  const type = () => cleanOpenGraphType(options.type);
  const twitterCard = () =>
    (image() ? 'summary_large_image' : 'summary') as
      | 'summary'
      | 'summary_large_image';

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: () => image() || undefined,
    ogImageAlt: () => imageAlt() || undefined,
    ogSiteName: siteName,
    ogType: type,
    twitterCard,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: () => image() || undefined,
    twitterImageAlt: () => imageAlt() || undefined,
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
