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
