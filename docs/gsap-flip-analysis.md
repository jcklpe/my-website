# GSAP Flip Analysis

## Context

This note was written during the `gendes-seamless.codex` branch after using the Tympanus/Codrops IntroTrailEffect demo as the primary reference:

- Demo: https://tympanus.net/Development/IntroTrailEffect/
- Article: https://tympanus.net/codrops/2022/05/03/image-trail-animation-for-an-intro/
- Source: https://github.com/codrops/IntroTrailEffect

The branch explored a "Seamless Arch Trail" direction: dark stage surfaces, arched media frames, image trail echoes, and route transitions that make featured images feel like shared objects moving between resting states.

## What GSAP Flip Does

GSAP Flip is a library implementation of the FLIP animation technique:

- **First**: capture an element's current layout state.
- **Last**: change the DOM/layout into its final state.
- **Invert**: apply transforms so the element visually appears to still be in its first state.
- **Play**: animate those transforms back to zero so the element moves into its final layout.

Its main strength is animating layout changes that would otherwise jump: reparenting an element, changing grid placement, toggling expanded states, or moving one object between containers on the same page.

In the Codrops demo, GSAP Flip works especially well because the intro image and title elements remain in the same document. The script captures their state, appends them into new containers, and lets Flip animate the delta. This creates the feeling that one media object is being physically staged in multiple locations.

## How This Project Already Relates

This repo already has a custom route-transition system that follows the same broad idea:

- `apps/frontend/composables/useFeaturedMediaTransition.ts`
- `apps/frontend/components/transitions/FeaturedMediaTransitionLayer.vue`
- `apps/frontend/components/content/FeaturedMediaFrame.vue`
- `apps/frontend/components/navigation/cards/CaseStudyCard.vue`
- `apps/frontend/components/navigation/cards/PostCard.vue`

The current system:

- measures the source card media/title/meta geometry,
- navigates to the target Nuxt route,
- waits for the target page to render,
- measures the target media/title/meta geometry,
- animates a temporary overlay between those states.

This is effectively a custom, route-aware FLIP-style coordinator. It does not move the real DOM node between pages. Instead, it uses a persistent overlay clone because Nuxt route navigation unmounts the source page and mounts the target page.

That difference matters. GSAP Flip is most natural when the same DOM document contains both the before and after layout states. Our route transitions need to bridge page teardown and page mount, so some kind of persistent overlay or transition layer is still required even if GSAP is introduced.

## Recommendation

Do **not** migrate mainline to GSAP Flip by default.

The current custom coordinator is better matched to the site's existing route-transition problem than a straightforward GSAP Flip migration would be. It is small, understandable, SSR/static-compatible, and already integrated with Nuxt route timing, reduced-motion checks, reverse transitions, scroll handling, and the data attributes on cards/detail heroes.

What should be carried forward from this branch is the **FLIP mental model**, not necessarily the GSAP dependency:

- Treat featured media as shared objects with multiple resting states.
- Design card, hero, archive, and next/previous surfaces as intentional layout homes for the same object.
- Keep transition hooks (`data-featured-*`, clip paths, measured title/meta nodes) stable.
- Use the overlay layer to preserve continuity across route unmount/mount boundaries.
- Let masks, title slips, and image trails make the motion feel more physical.

## When GSAP Flip Might Be Worth Adding

GSAP Flip becomes more attractive if the final synthesis requires interactions that are awkward to maintain by hand:

- multiple shared elements moving at once with complex staggered choreography,
- same-page DOM reparenting where a real element moves between containers,
- gallery/list/detail states that toggle without route navigation,
- interruptible or reversible animation timelines,
- rotation, skew, 3D transforms, or transform-origin choreography beyond simple rect interpolation,
- repeated layout-change animations where hand-written measurement code would become a broader mini-framework.

If that happens, prefer a narrow prototype first. Add GSAP only around the interaction that truly needs it, rather than replacing the existing route-transition coordinator wholesale.

## Risks Of Migrating Too Early

- **Route lifecycle mismatch**: GSAP Flip does not remove the need to coordinate Nuxt navigation, source unmount, target mount, scroll position, and overlay cleanup.
- **Additional dependency weight**: `gsap` would become a frontend dependency for an effect the site already handles locally.
- **SSR/static caution**: GSAP usage must be strictly client-only. Static generation is fine if guarded properly, but careless imports or DOM reads can create hydration/build issues.
- **More animation API surface**: Future agents would need to understand Vue, Nuxt routing, the current transition coordinator, and GSAP timelines.
- **Potential overreach**: The design goal is seamless shared-element motion, not adopting a motion library as an end in itself.

## What To Preserve From `gendes-seamless.codex`

Useful ideas independent of GSAP:

- Longer, more cinematic route timing.
- Image trail clones in `FeaturedMediaTransitionLayer.vue`.
- Arched clip paths as destination/resting states.
- Dark stage palette with warm display type and muted sage navigation.
- Homepage/detail/list compositions that make media feel like the same object being re-staged.
- Title/meta slip panels that travel with media without hiding the content model.

The final synthesis can adopt any of these while keeping the current implementation architecture.

## Practical Future Path

For mainline synthesis:

1. Keep the custom featured-media coordinator unless a specific interaction proves too complex.
2. Preserve or refine the image-trail overlay if it survives visual QA.
3. Keep clip-path/mask animation as a first-class part of the card-to-detail grammar.
4. If GSAP Flip is considered later, prototype it on a same-page interaction first, such as a gallery expansion or homepage feature module, before touching route transitions.
5. Document any GSAP adoption in `docs/design-system.md` or a dedicated motion note so future agents know which layer owns which motion responsibilities.
