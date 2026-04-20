const htmlEntityMap: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

export function decodeHtmlEntities(value: string) {
  return value.replace(
    /&(#x?[0-9a-f]+|[a-z]+);/gi,
    (entity, encoded: string) => {
      if (encoded.startsWith('#x')) {
        return String.fromCodePoint(Number.parseInt(encoded.slice(2), 16));
      }

      if (encoded.startsWith('#')) {
        return String.fromCodePoint(Number.parseInt(encoded.slice(1), 10));
      }

      return htmlEntityMap[encoded.toLowerCase()] ?? entity;
    },
  );
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function extractTagText(html: string | null | undefined, tagName: string) {
  if (!html) {
    return '';
  }

  const tagPattern = new RegExp(
    `<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
    'i',
  );
  const match = html.match(tagPattern);
  const innerHtml = match?.[1] ?? html;

  return decodeHtmlEntities(innerHtml.replace(/<[^>]*>/g, '')).trimEnd();
}

export function stripHtmlToText(html: string | null | undefined) {
  if (!html) {
    return '';
  }

  return decodeHtmlEntities(html.replace(/<[^>]*>/g, '')).trim();
}

export function extractClassNames(html: string | null | undefined) {
  if (!html) {
    return [];
  }

  const classAttributes = html.match(/\bclass=(["'])(.*?)\1/gi) ?? [];

  return classAttributes.flatMap((attribute) => {
    const value = attribute.replace(/^class=(["'])|(["'])$/gi, '');

    return value.split(/\s+/).filter(Boolean);
  });
}

export function extractStyleValue(
  html: string | null | undefined,
  propertyName: string,
) {
  if (!html) {
    return null;
  }

  const styleAttributes = html.match(/\bstyle=(["'])(.*?)\1/gi) ?? [];
  const propertyPattern = new RegExp(
    `${propertyName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*:\\s*([^;]+)`,
    'i',
  );

  for (const attribute of styleAttributes) {
    const value = attribute.replace(/^style=(["'])|(["'])$/gi, '');
    const propertyValue = value.match(propertyPattern)?.[1]?.trim();

    if (propertyValue) {
      return propertyValue;
    }
  }

  return null;
}

export interface HtmlRootElement {
  tagName: string;
  attributes: string;
  innerHtml: string;
}

export interface HtmlAnchorElement {
  attributes: string;
  innerHtml: string;
  href: string;
  target: string;
  rel: string;
  download: string;
}

export interface HtmlTableElement {
  innerHtml: string;
  captionHtml: string;
}

export interface HtmlImageElement {
  attributes: string;
  src: string;
  alt: string;
}

export function extractRootElement(
  html: string | null | undefined,
  preferredTagName?: string,
): HtmlRootElement | null {
  if (!html) {
    return null;
  }

  const trimmedHtml = html.trim();
  const tagNamePattern = preferredTagName
    ? preferredTagName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    : '[a-z][a-z0-9-]*';
  const rootPattern = new RegExp(
    `<(${tagNamePattern})\\b([^>]*)>([\\s\\S]*)<\\/\\1>`,
    'i',
  );
  const match = trimmedHtml.match(rootPattern);

  if (!match) {
    return null;
  }

  return {
    tagName: match[1].toLowerCase(),
    attributes: match[2] ?? '',
    innerHtml: match[3] ?? '',
  };
}

export function extractAttribute(
  attributes: string | null | undefined,
  attributeName: string,
) {
  if (!attributes) {
    return '';
  }

  const attributePattern = new RegExp(
    `\\b${attributeName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}=(["'])(.*?)\\1`,
    'i',
  );

  return attributes.match(attributePattern)?.[2] ?? '';
}

export function extractFirstAnchor(
  html: string | null | undefined,
): HtmlAnchorElement | null {
  if (!html) {
    return null;
  }

  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/i;
  const match = html.match(anchorPattern);

  if (!match) {
    return null;
  }

  const attributes = match[1] ?? '';

  return {
    attributes,
    innerHtml: match[2]?.trim() ?? '',
    href: decodeHtmlEntities(extractAttribute(attributes, 'href')),
    target: extractAttribute(attributes, 'target'),
    rel: extractAttribute(attributes, 'rel'),
    download: extractAttribute(attributes, 'download'),
  };
}

export function extractAnchors(
  html: string | null | undefined,
): HtmlAnchorElement[] {
  if (!html) {
    return [];
  }

  return Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)).map(
    (match) => {
      const attributes = match[1] ?? '';

      return {
        attributes,
        innerHtml: match[2]?.trim() ?? '',
        href: decodeHtmlEntities(extractAttribute(attributes, 'href')),
        target: extractAttribute(attributes, 'target'),
        rel: extractAttribute(attributes, 'rel'),
        download: extractAttribute(attributes, 'download'),
      };
    },
  );
}

export function extractElementInnerHtml(
  html: string | null | undefined,
  tagName: string,
) {
  return extractRootElement(html, tagName)?.innerHtml ?? '';
}

export function extractFirstElementHtml(
  html: string | null | undefined,
  tagName: string,
) {
  if (!html) {
    return '';
  }

  const safeTagName = tagName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const elementPattern = new RegExp(
    `<${safeTagName}\\b[^>]*>[\\s\\S]*?<\\/${safeTagName}>`,
    'i',
  );

  return html.match(elementPattern)?.[0] ?? '';
}

export function extractElementInnerHtmlByClass(
  html: string | null | undefined,
  className: string,
) {
  if (!html) {
    return '';
  }

  const safeClassName = className.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const elementPattern = new RegExp(
    `<([a-z][a-z0-9-]*)\\b(?=[^>]*\\bclass=(["'])[^"']*\\b${safeClassName}\\b[^"']*\\2)[^>]*>([\\s\\S]*?)<\\/\\1>`,
    'i',
  );

  return html.match(elementPattern)?.[3]?.trim() ?? '';
}

export function extractFirstImage(
  html: string | null | undefined,
): HtmlImageElement | null {
  if (!html) {
    return null;
  }

  const imagePattern = /<img\b([^>]*)\/?>/i;
  const match = html.match(imagePattern);

  if (!match) {
    return null;
  }

  const attributes = match[1] ?? '';

  return {
    attributes,
    src: decodeHtmlEntities(extractAttribute(attributes, 'src')),
    alt: decodeHtmlEntities(extractAttribute(attributes, 'alt')),
  };
}

export function extractFigcaptionHtml(html: string | null | undefined) {
  const figcaptionHtml = extractFirstElementHtml(html, 'figcaption');

  return figcaptionHtml.replace(/^<figcaption\b[^>]*>/i, '').replace(
    /<\/figcaption>$/i,
    '',
  );
}

export function removeWordPressBlockClasses(className: string) {
  return className
    .split(/\s+/)
    .filter((name) => name && !name.startsWith('wp-block-'))
    .join(' ');
}

export function removeWordPressFrontendClasses(className: string) {
  return className
    .split(/\s+/)
    .filter(
      (name) =>
        name &&
        !name.startsWith('wp-block-') &&
        !/^wp-image-\d+$/.test(name) &&
        !name.startsWith('wp-element-'),
    )
    .join(' ');
}

export function stripWordPressBlockClassesFromHtml(html: string) {
  return html
    .replace(/\sclass=(["'])(.*?)\1/gi, (attribute, quote: string, value: string) => {
      const cleanClassName = removeWordPressBlockClasses(value);

      return cleanClassName ? ` class=${quote}${cleanClassName}${quote}` : '';
    })
    .trim();
}

export function stripWordPressFrontendClassesFromHtml(html: string) {
  return html
    .replace(/\sclass=(["'])(.*?)\1/gi, (attribute, quote: string, value: string) => {
      const cleanClassName = removeWordPressFrontendClasses(value);

      return cleanClassName ? ` class=${quote}${cleanClassName}${quote}` : '';
    })
    .trim();
}
