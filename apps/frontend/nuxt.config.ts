import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('../../', import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxt/eslint'],
  ssr: true,
  devtools: { enabled: true },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  css: ['~/assets/scss/main.scss'],
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://my-website.localhost',
      wordpressGraphqlUrl: process.env.NUXT_PUBLIC_WORDPRESS_GRAPHQL_URL
        ?? 'http://127.0.0.1:8080/graphql',
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
})
