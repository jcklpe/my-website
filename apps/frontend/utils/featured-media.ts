import type { FeaturedImage, FeaturedMediaTreatment } from '~/types/wordpress';

export const CASE_STUDY_HALFTONE_SIZE_PREFIX = 'case-study-halftone-';

type GeneratedMediaSize = {
  name: string;
  sourceUrl: string;
  width: number;
  height: number;
};

type MediaImageSource = {
  sourceUrl: string;
  srcSet?: string;
  width?: number | null;
  height?: number | null;
  treatment: FeaturedMediaTreatment;
};

function isCaseStudyHalftoneSizeName(name?: string | null) {
  return Boolean(name?.startsWith(CASE_STUDY_HALFTONE_SIZE_PREFIX));
}

function generatedMediaSizes(
  media?: FeaturedImage | null,
  options: { includeHalftone?: boolean; onlyHalftone?: boolean } = {},
): GeneratedMediaSize[] {
  return (media?.mediaDetails?.sizes ?? [])
    .filter((size) => size.sourceUrl)
    .map((size) => ({
      name: size.name ?? '',
      sourceUrl: size.sourceUrl ?? '',
      width: Number(size.width ?? 0),
      height: Number(size.height ?? 0),
    }))
    .filter((size) => {
      if (!size.sourceUrl || size.width <= 0) {
        return false;
      }

      const isHalftone = isCaseStudyHalftoneSizeName(size.name);

      if (options.onlyHalftone) {
        return isHalftone;
      }

      return options.includeHalftone || !isHalftone;
    })
    .sort((first, second) => first.width - second.width);
}

function mediaSizeForWidth(
  sizes: GeneratedMediaSize[],
  targetWidth?: number,
) {
  if (!sizes.length) {
    return null;
  }

  if (!targetWidth) {
    return sizes[sizes.length - 1] ?? null;
  }

  return (
    sizes.find((size) => size.width >= targetWidth) ??
    sizes[sizes.length - 1] ??
    null
  );
}

function srcSetForSizes(sizes: GeneratedMediaSize[]) {
  const uniqueSizesByWidth = new Map<number, GeneratedMediaSize>();

  sizes.forEach((size) => {
    if (!uniqueSizesByWidth.has(size.width)) {
      uniqueSizesByWidth.set(size.width, size);
    }
  });

  return [...uniqueSizesByWidth.values()]
    .map((size) => `${size.sourceUrl} ${size.width}w`)
    .join(', ');
}

export function mediaSourceUrlForWidth(
  media?: FeaturedImage | null,
  targetWidth?: number,
) {
  if (!media?.sourceUrl) {
    return '';
  }

  const size = mediaSizeForWidth(generatedMediaSizes(media), targetWidth);

  return size?.sourceUrl ?? media.sourceUrl;
}

export function hasCaseStudyHalftoneMedia(media?: FeaturedImage | null) {
  return generatedMediaSizes(media, { onlyHalftone: true }).length > 0;
}

export function mediaImageSourceForTreatment(
  media?: FeaturedImage | null,
  treatment: FeaturedMediaTreatment = 'default',
  targetWidth?: number,
): MediaImageSource {
  if (!media?.sourceUrl) {
    return {
      sourceUrl: '',
      treatment: 'default',
    };
  }

  if (treatment === 'case-study-halftone') {
    const halftoneSizes = generatedMediaSizes(media, { onlyHalftone: true });
    const halftoneSize = mediaSizeForWidth(halftoneSizes, targetWidth);

    if (halftoneSize) {
      return {
        sourceUrl: halftoneSize.sourceUrl,
        srcSet: srcSetForSizes(halftoneSizes),
        width: halftoneSize.width,
        height: halftoneSize.height || null,
        treatment,
      };
    }
  }

  const defaultSizes = generatedMediaSizes(media);
  const defaultSize = mediaSizeForWidth(defaultSizes, targetWidth);

  return {
    sourceUrl: defaultSize?.sourceUrl ?? media.sourceUrl,
    srcSet: srcSetForSizes(defaultSizes) || media.srcSet || undefined,
    width: defaultSize?.width ?? media.mediaDetails?.width ?? null,
    height: defaultSize?.height ?? media.mediaDetails?.height ?? null,
    treatment: 'default',
  };
}
