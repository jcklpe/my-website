import { nextTick, ref } from 'vue';

/**
 * Collision-aware sidenote layout coordinator.
 *
 * Each FootnoteSidenote calls scheduleSidenoteLayout() after measuring its
 * desired position. The scheduler debounces all calls in a single rAF, then
 * sorts sidenotes by natural position and pushes overlapping ones down.
 * The `is-positioned` class (which triggers the opacity fade-in) is applied
 * here — after layout — so sidenotes never flash at the wrong position.
 *
 * Overflow detection: if stacking pushes a sidenote more than MAX_DISPLACEMENT_VH
 * (currently 75%) of the viewport height away from its marker, it gets
 * `is-overflow` instead of `is-positioned`. ParagraphBlock detects this class
 * and falls back to the in-note pattern for that marker on desktop.
 */

const GAP = 8; // px between stacked sidenotes
const MAX_DISPLACEMENT_VH = 0.75; // fraction of viewport height before overflow

let scheduled = false;
let resizeInstalled = false;

// Reactive set of sidenote UUIDs whose content exceeds the collapsed max-height.
// Set by the layout pass (which runs at the right time with correct measurements)
// and consumed by FootnoteSidenote to show/hide the "see more" button.
export const truncatedSidenoteUuids = ref(new Set<string>());

export function scheduleSidenoteLayout() {
  if (import.meta.server) return;

  // Re-run the layout on viewport resize so that text-reflow changes to
  // sidenote heights and marker positions are picked up.
  if (!resizeInstalled) {
    resizeInstalled = true;
    window.addEventListener('resize', () => scheduleSidenoteLayout(), { passive: true });
  }

  if (scheduled) return;
  scheduled = true;

  // nextTick ensures we run after Vue has finished its DOM-update flush
  // (including Teleport activations), so all sidenotes are in .content-flow
  // before we measure. rAF alone fires too early — before the Teleport move.
  //
  // document.fonts.ready ensures custom web fonts are loaded before we measure
  // sidenote heights — without this, fallback-font measurements underestimate
  // tall sidenotes (e.g. multi-paragraph note 18) and they extend into obstacles.
  nextTick(() => {
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      scheduled = false;
      for (const cf of document.querySelectorAll<HTMLElement>('.content-flow')) {
        resolveSidenoteCollisions(cf);
      }
    });
  });
}

function resolveSidenoteCollisions(contentFlow: HTMLElement) {
  const els = [
    ...contentFlow.querySelectorAll<HTMLElement>('.footnote-sidenote[data-uuid]'),
  ];
  if (els.length === 0) return;

  const flowRect = contentFlow.getBoundingClientRect();

  // Re-measure desired positions every layout pass so that viewport resizes
  // (which reflow marker positions) are reflected without a full remount.
  for (const el of els) {
    const uuid = el.dataset.uuid;
    const marker = uuid
      ? document.querySelector<HTMLElement>(`sup[data-fn="${uuid}"]`)
      : null;
    if (marker) {
      el.dataset.desiredTop = String(
        marker.getBoundingClientRect().top - flowRect.top,
      );
    }
  }

  const measured = els.filter((el) => el.dataset.desiredTop !== undefined);

  // Temporarily un-hide any is-overflow elements so their offsetHeight is
  // measurable (display:none returns 0). They start with opacity:0 regardless,
  // so removing the class doesn't cause a visual flash.
  for (const el of measured) el.classList.remove('is-overflow');
  void contentFlow.offsetHeight; // sync reflow so the display change takes effect

  // Sort by natural (marker-aligned) position, then push each one down past
  // the previous sidenote's bottom edge.
  measured.sort((a, b) => Number(a.dataset.desiredTop) - Number(b.dataset.desiredTop));

  // Collect elements that occupy the sidenote column, sorted top→bottom so
  // a single forward pass correctly handles consecutive obstacles.
  // - .alignright floats extend into the right margin
  // - .alignwide / .alignfull blocks span the full sidenote column and beyond
  const columnObstacles = [
    ...contentFlow.querySelectorAll<HTMLElement>('.alignright, .alignwide, .alignfull'),
  ]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - flowRect.top, bottom: r.bottom - flowRect.top };
    })
    .sort((a, b) => a.top - b.top);

  const maxDisplacement = window.innerHeight * MAX_DISPLACEMENT_VH;
  let floor = 0;
  let hasExpandedUpstream = false;
  const newTruncated = new Set<string>();

  for (const el of measured) {
    const desired = Number(el.dataset.desiredTop);
    const isExpanded = el.classList.contains('is-expanded');
    const uuid = el.dataset.uuid;
    let top = Math.max(desired, floor);

    if (isExpanded) {
      // Expanded notes overlay content below — the user explicitly chose this.
      // Skip obstacle avoidance and retain previous truncation state (body is
      // unconstrained so scrollHeight ≈ clientHeight, which would mislead detection).
      if (uuid && truncatedSidenoteUuids.value.has(uuid)) newTruncated.add(uuid);
      hasExpandedUpstream = true;
    } else {
      // Truncation detection: does this note's full content height extend INTO
      // a column obstacle? Uses scrollHeight (ignores any CSS max-height cap) so
      // the check is stable across layout passes.
      // Only fires when the note STARTS above the obstacle — notes that are
      // already positioned inside an obstacle due to stacking are handled by
      // avoidance below, not by truncation.
      if (uuid) {
        const body = el.querySelector<HTMLElement>('.sidenote-body');
        const fullHeight = body ? body.scrollHeight : el.offsetHeight;
        for (const obstacle of columnObstacles) {
          if (top < obstacle.top && top + fullHeight > obstacle.top) {
            newTruncated.add(uuid);
            break;
          }
        }
      }

      // Obstacle avoidance: push the note below any obstacle it would physically
      // overlap. Uses el.offsetHeight, which is capped (8rem) when is-truncated
      // is set — so truncated notes don't collide and don't get pushed far.
      for (const obstacle of columnObstacles) {
        if (top < obstacle.bottom && top + el.offsetHeight > obstacle.top) {
          top = Math.max(top, obstacle.bottom + GAP);
        }
      }
    }

    // Capture height before classification — is-overflow sets display:none → 0.
    const height = el.offsetHeight;

    el.style.top = `${top}px`;

    // Overflow: notes displaced too far from their marker fall back to the
    // in-note pattern. Notes downstream of an expanded note skip this check —
    // the user deliberately expanded a note, so notes below should slide down
    // rather than disappear.
    if (!isExpanded && !hasExpandedUpstream && top - desired > maxDisplacement) {
      el.classList.remove('is-positioned');
      el.classList.add('is-overflow');
    } else {
      el.classList.add('is-positioned');
      el.classList.remove('is-overflow');
      floor = top + height + GAP;
    }
  }

  // Schedule a second pass if truncation state changed so Vue can re-render the
  // "more ↓" buttons and the layout can use the correct capped heights.
  const prevTruncated = truncatedSidenoteUuids.value;
  const truncationChanged =
    prevTruncated.size !== newTruncated.size ||
    [...newTruncated].some((uuid) => !prevTruncated.has(uuid));
  truncatedSidenoteUuids.value = newTruncated;
  if (truncationChanged) nextTick(() => scheduleSidenoteLayout());
}
