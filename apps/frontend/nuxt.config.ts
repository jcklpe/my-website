import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { discoverStaticRoutes } from './scripts/static-routes.mjs';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));
const shouldDiscoverStaticRoutes = process.env.NUXT_STATIC_GENERATE === '1';
const staticDeployConfig = readStaticDeployConfig();
const phonePreview = process.env.NUXT_PHONE_PREVIEW === '1';
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
  css: ['photoswipe/style.css', '~/assets/scss/main.scss'],
  runtimeConfig: {
    phonePreview,
    wordpressGraphqlUrl,
    devWordpressGraphqlUrl: qaWordpressGraphqlUrl,
    qaWordpressGraphqlUrl,
    staticCmsEnvironment: shouldDiscoverStaticRoutes
      ? staticCmsEnvironment
      : '',
    public: {
      phonePreview,
      siteUrl: shouldDiscoverStaticRoutes
        ? staticDeployConfig.publicSiteUrl
        : (process.env.NUXT_PUBLIC_SITE_URL ?? 'http://my-website.localhost'),
      staticGenerated: shouldDiscoverStaticRoutes,
      staticDeployEnvironment: shouldDiscoverStaticRoutes
        ? staticDeployConfig.environment
        : '',
      staticCmsEnvironment: shouldDiscoverStaticRoutes
        ? staticCmsEnvironment
        : '',
      wordpressGraphqlUrl: shouldDiscoverStaticRoutes
        ? ''
        : phonePreview
          ? '/__phone-cms/graphql'
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
      ignore: shouldDiscoverStaticRoutes ? ['/dev'] : [],
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
        {
          rel: 'manifest',
          href: '/site.webmanifest',
        },
      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'theme-color',
          content: '#2657eb',
        },
        {
          key: 'theme-color-light',
          name: 'theme-color',
          media: '(prefers-color-scheme: light)',
          content: '#2657eb',
        },
        {
          key: 'theme-color-dark',
          name: 'theme-color',
          media: '(prefers-color-scheme: dark)',
          content: '#2657eb',
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

function readStaticDeployConfig() {
  const deployEnvPath = fileURLToPath(
    new URL('../../.env.deploy', import.meta.url),
  );
  let deployEnv = '';

  try {
    deployEnv = readFileSync(deployEnvPath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  const fileValues = Object.fromEntries(
    deployEnv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        const key = line.slice(0, separatorIndex).trim();
        const value = line
          .slice(separatorIndex + 1)
          .trim()
          .replace(/^(['"])(.*)\1$/, '$2');

        return [key, value];
      }),
  );

  return {
    environment:
      process.env.STATIC_DEPLOY_ENV ??
      fileValues.STATIC_DEPLOY_ENV ??
      'preview',
    publicSiteUrl:
      process.env.STATIC_PUBLIC_SITE_URL ??
      fileValues.STATIC_PUBLIC_SITE_URL ??
      'http://my-website.localhost',
  };
}
