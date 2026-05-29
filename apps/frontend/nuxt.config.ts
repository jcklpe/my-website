import { fileURLToPath } from 'node:url';
import { discoverStaticRoutes } from './scripts/static-routes.mjs';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));
const shouldDiscoverStaticRoutes = process.env.NUXT_STATIC_GENERATE === '1';
const staticCmsEnvironment = resolveStaticCmsEnvironment(
  process.env.NUXT_STATIC_CMS_ENV,
);
const wordpressGraphqlUrl =
  process.env.NUXT_WORDPRESS_GRAPHQL_URL ??
  process.env.NUXT_PUBLIC_WORDPRESS_GRAPHQL_URL ??
  'http://127.0.0.1:8080/graphql';
const qaWordpressGraphqlUrl =
  process.env.NUXT_QA_WORDPRESS_GRAPHQL_URL ??
  process.env.NUXT_PUBLIC_QA_WORDPRESS_GRAPHQL_URL ??
  process.env.NUXT_DEV_WORDPRESS_GRAPHQL_URL ??
  process.env.NUXT_PUBLIC_DEV_WORDPRESS_GRAPHQL_URL ??
  'http://127.0.0.1:8081/graphql';
const publicWordPressGraphqlUrl =
  process.env.NUXT_PUBLIC_WORDPRESS_GRAPHQL_URL ??
  'http://cms.my-website.localhost/graphql';
const publicQaWordPressGraphqlUrl =
  process.env.NUXT_PUBLIC_QA_WORDPRESS_GRAPHQL_URL ??
  process.env.NUXT_PUBLIC_DEV_WORDPRESS_GRAPHQL_URL ??
  'http://qa.cms.my-website.localhost/graphql';
const staticWordPressGraphqlUrl =
  staticCmsEnvironment === 'qa' ? qaWordpressGraphqlUrl : wordpressGraphqlUrl;
const staticPrerenderRoutes = shouldDiscoverStaticRoutes
  ? await discoverStaticRoutes({
      endpoint: staticWordPressGraphqlUrl,
      strict: true,
      log: true,
    })
  : [];

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  buildDir: shouldDiscoverStaticRoutes
    ? '../../.nuxt-static/frontend'
    : '.nuxt',
  modules: ['@nuxt/eslint'],
  ssr: true,
  devtools: { enabled: true },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  css: ['~/assets/scss/main.scss', 'photoswipe/style.css'],
  runtimeConfig: {
    wordpressGraphqlUrl,
    devWordpressGraphqlUrl: qaWordpressGraphqlUrl,
    qaWordpressGraphqlUrl,
    staticCmsEnvironment: shouldDiscoverStaticRoutes
      ? staticCmsEnvironment
      : '',
    public: {
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL ?? 'http://my-website.localhost',
      staticGenerated: shouldDiscoverStaticRoutes,
      staticCmsEnvironment: shouldDiscoverStaticRoutes
        ? staticCmsEnvironment
        : '',
      wordpressGraphqlUrl: shouldDiscoverStaticRoutes
        ? ''
        : publicWordPressGraphqlUrl,
      devWordpressGraphqlUrl: shouldDiscoverStaticRoutes
        ? ''
        : publicQaWordPressGraphqlUrl,
      qaWordpressGraphqlUrl: shouldDiscoverStaticRoutes
        ? ''
        : publicQaWordPressGraphqlUrl,
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: staticPrerenderRoutes,
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "${rootDir}/packages/styles/context-role/vue-frontend-component" as *;
          `,
        },
      },
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      titleTemplate: '%s | My Website',
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon.png',
        },
      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
      ],
    },
  },
  typescript: {
    typeCheck: true,
  },
  eslint: {
    config: {
      stylistic: false,
    },
  },
});

function resolveStaticCmsEnvironment(value?: string) {
  return value === 'qa' || value === 'dev' ? 'qa' : 'public';
}
