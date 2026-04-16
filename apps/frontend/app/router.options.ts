import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig>{
  scrollBehavior(to, _from, savedPosition) {
    if (
      globalThis.sessionStorage?.getItem('featured-media-transition-active') ===
      'true'
    ) {
      return false;
    }

    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    }

    return {
      left: 0,
      top: 0,
    };
  },
};
