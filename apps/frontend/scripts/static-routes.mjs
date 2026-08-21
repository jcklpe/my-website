import { pathToFileURL } from 'node:url';

const fixedRoutes = ['/', '/about', '/now', '/side-projects', '/writing'];

const defaultWordPressGraphqlUrl = 'http://127.0.0.1:8080/graphql';
const defaultDevWordPressGraphqlUrl = 'http://127.0.0.1:8081/graphql';

export async function discoverStaticRoutes(options = {}) {
  const endpoint = options.endpoint ?? defaultGraphqlEndpoint();

  try {
    const [postSlugs, caseStudySlugs] = await Promise.all([
      fetchSlugs(endpoint, 'posts', 'GetStaticPostSlugs'),
      fetchSlugs(endpoint, 'caseStudies', 'GetStaticCaseStudySlugs'),
    ]);

    const routes = new Set(fixedRoutes);

    for (const slug of postSlugs) {
      routes.add(`/writing/${slug}`);
    }

    for (const slug of caseStudySlugs) {
      routes.add(`/case-studies/${slug}`);
    }

    const discoveredRoutes = [...routes];

    if (options.log) {
      console.log(
        `Discovered ${discoveredRoutes.length} static routes from ${endpoint}`,
      );
    }

    return discoveredRoutes;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown route discovery error';

    if (options.strict) {
      throw new Error(`Static route discovery failed: ${message}`);
    }

    console.warn(
      `Static route discovery failed, using fixed routes only: ${message}`,
    );

    return fixedRoutes;
  }
}

function defaultGraphqlEndpoint() {
  const cmsEnvironment =
    process.env.NUXT_STATIC_CMS_ENV === 'qa' ||
    process.env.NUXT_STATIC_CMS_ENV === 'dev'
      ? 'qa'
      : 'public';

  if (cmsEnvironment === 'qa') {
    return (
      process.env.NUXT_QA_WORDPRESS_GRAPHQL_URL ??
      process.env.NUXT_PUBLIC_QA_WORDPRESS_GRAPHQL_URL ??
      process.env.NUXT_DEV_WORDPRESS_GRAPHQL_URL ??
      process.env.NUXT_PUBLIC_DEV_WORDPRESS_GRAPHQL_URL ??
      defaultDevWordPressGraphqlUrl
    );
  }

  return (
    process.env.NUXT_WORDPRESS_GRAPHQL_URL ??
    process.env.NUXT_PUBLIC_WORDPRESS_GRAPHQL_URL ??
    defaultWordPressGraphqlUrl
  );
}

async function fetchSlugs(endpoint, fieldName, operationName) {
  const slugs = [];
  let after = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: slugQuery(fieldName, operationName),
        variables: { after },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `${operationName} failed with HTTP status ${response.status}`,
      );
    }

    const payload = await response.json();
    const errors = payload.errors ?? [];

    if (errors.length) {
      const details = errors
        .map((error) => error.message)
        .filter(Boolean)
        .join('; ');

      throw new Error(`${operationName} returned GraphQL errors: ${details}`);
    }

    const page = payload.data?.[fieldName];

    if (!page) {
      throw new Error(`${operationName} did not return ${fieldName}`);
    }

    for (const node of page.nodes ?? []) {
      if (node.slug) {
        slugs.push(node.slug);
      }
    }

    hasNextPage = Boolean(page.pageInfo?.hasNextPage);
    after = page.pageInfo?.endCursor ?? null;
  }

  return slugs;
}

function slugQuery(fieldName, operationName) {
  return `
    query ${operationName}($after: String) {
      ${fieldName}(first: 100, after: $after) {
        nodes {
          slug
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const routes = await discoverStaticRoutes({ strict: true, log: true });

  for (const route of routes) {
    console.log(route);
  }
}
