<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  const props = defineProps<{
    caseStudies: WordPressCaseStudy[];
    enableAmbientCurrent?: boolean;
    enableOrdinalStar?: boolean;
    enableOrdinalWave?: boolean;
    enableOrbitDots?: boolean;
    enableBreathingBrackets?: boolean;
    enableRotatingDial?: boolean;
  }>();

  // Case-hero spike: score v7 — text-dominant rows, photos as the
  // interruption (the user's sketch):
  //
  //   #######01######      banner: full photo band over the text row
  //   ------01-------
  //   #02#-----02----      photo-left: inline plate beside a text row
  //   ----03-----#03#      photo-right: mirrored
  //   ######04#######      banner again, text docked right
  //   -----------04--
  //
  // The text plates are the section's steady vertical rhythm; the case
  // study's own hero image interrupts horizontally — full banner above some
  // rows, inline plate left or right on others. Text-block alignment varies
  // for extra horizontal rhythm. Every row is full width, so this stays
  // strata (and stays distinct from the writing section's bento grammar).
  // Bookends are banners (opener text-left, closer text-right); the middle
  // phrase cycles, holding 3–8 studies. Rationale and revision history live
  // in docs/archive/case-hero.md ("The composition problem").
  // Inline rows come in two photo tiers. Narrow keeps the photo small
  // beside the text; wide is a taller row with the photo at 60% of the
  // width and a squarer text plate (the user's sketch):
  //
  //   ------- ######
  //   ------- ######
  //
  // Tier geometry resolves to --inline-photo-width / --card-min-height on
  // the list item.
  type RowLayout = 'banner' | 'photo-left' | 'photo-right';
  type PhotoTier = 'narrow' | 'wide';

  type RowBeat = {
    layout: RowLayout;
    plateAlign: 'left' | 'right';
    photoTier?: PhotoTier;
  };

  type ResolvedBeat = {
    layout: RowLayout;
    plateAlign: 'left' | 'right';
    photoWidth?: string;
    rowHeight?: string;
  };

  // Narrow photo widths jitter by row index (roughly 30–41% of the row), so
  // consecutive narrow rows never line up — even if every study were set to
  // the same narrow layout in the CMS.
  const NARROW_PHOTO_WIDTHS = [
    'clamp(250px, 36%, 500px)',
    'clamp(220px, 30%, 430px)',
    'clamp(280px, 41%, 560px)',
    'clamp(235px, 33%, 470px)',
    'clamp(265px, 39%, 530px)',
  ];

  // Wide tier: photo at 60% of the row, squarer text plate, taller row.
  // Bare percentage, no px cap — a cap let the 1fr text plate outgrow the
  // photo on wide viewports, and the wide tier's defining invariant is
  // photo plate WIDER than text plate, always.
  const WIDE_PHOTO_WIDTH = '60%';
  const WIDE_ROW_HEIGHT = 'clamp(340px, 40vh, 520px)';

  const OPENING_BEAT: RowBeat = { layout: 'banner', plateAlign: 'left' };
  const CLOSING_BEAT: RowBeat = { layout: 'banner', plateAlign: 'right' };
  const MIDDLE_PHRASE: RowBeat[] = [
    { layout: 'photo-left', plateAlign: 'left', photoTier: 'narrow' },
    { layout: 'photo-right', plateAlign: 'right', photoTier: 'narrow' },
    // The wide beat: squarer text plate left, photo right at 60%.
    { layout: 'photo-right', plateAlign: 'left', photoTier: 'wide' },
    { layout: 'photo-left', plateAlign: 'right', photoTier: 'narrow' },
    { layout: 'banner', plateAlign: 'left' },
  ];

  function scoreBeatFor(index: number): RowBeat {
    const count = props.caseStudies.length;

    if (index === 0) {
      return OPENING_BEAT;
    }

    if (index === count - 1) {
      return CLOSING_BEAT;
    }

    return MIDDLE_PHRASE[(index - 1) % MIDDLE_PHRASE.length]!;
  }

  // CMS overrides: each case study carries ACF radios for row layout and
  // text-plate alignment ("auto" defers to the score above). Layout values
  // arrive snake_case from WordPress.
  const CMS_LAYOUT_BEATS: Record<
    string,
    { layout: RowLayout; photoTier?: PhotoTier }
  > = {
    banner: { layout: 'banner' },
    narrow_photo_left: { layout: 'photo-left', photoTier: 'narrow' },
    narrow_photo_right: { layout: 'photo-right', photoTier: 'narrow' },
    wide_photo_left: { layout: 'photo-left', photoTier: 'wide' },
    wide_photo_right: { layout: 'photo-right', photoTier: 'wide' },
  };

  function beatFor(index: number): ResolvedBeat {
    let beat: RowBeat = { ...scoreBeatFor(index) };
    const study = props.caseStudies[index];

    const layoutChoice = study?.selectedWorkLayout;
    if (layoutChoice && layoutChoice !== 'auto') {
      const override = CMS_LAYOUT_BEATS[layoutChoice];

      if (override) {
        beat = { ...beat, ...override };
      }
    }

    const alignChoice = study?.selectedWorkTextAlign;
    if (alignChoice === 'left' || alignChoice === 'right') {
      beat.plateAlign = alignChoice;
    }

    const resolved: ResolvedBeat = {
      layout: beat.layout,
      plateAlign: beat.plateAlign,
    };

    if (beat.photoTier === 'narrow') {
      resolved.photoWidth =
        NARROW_PHOTO_WIDTHS[index % NARROW_PHOTO_WIDTHS.length];
    }

    if (beat.photoTier === 'wide') {
      resolved.photoWidth = WIDE_PHOTO_WIDTH;
      resolved.rowHeight = WIDE_ROW_HEIGHT;
    }

    return resolved;
  }

  function styleFor(index: number): Record<string, string> {
    const beat = beatFor(index);
    const style: Record<string, string> = {};

    if (beat.photoWidth) {
      style['--inline-photo-width'] = beat.photoWidth;
    }

    if (beat.rowHeight) {
      style['--card-min-height'] = beat.rowHeight;
    }

    return style;
  }
</script>

<template>
  <ul class="case-study-list">
    <li
      v-for="(caseStudy, index) in caseStudies"
      :key="caseStudy.id"
      :style="styleFor(index)"
    >
      <CaseStudyCard
        :case-study="caseStudy"
        :card-index="index"
        :is-first-card="index === 0"
        :layout="beatFor(index).layout"
        :plate-align="beatFor(index).plateAlign"
        enable-browse-motion
        :enable-ambient-current="enableAmbientCurrent"
        :enable-ordinal-star="enableOrdinalStar"
        :enable-ordinal-wave="enableOrdinalWave"
        :enable-orbit-dots="enableOrbitDots"
        :enable-breathing-brackets="enableBreathingBrackets"
        :enable-rotating-dial="enableRotatingDial"
      />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  // Full-width rows, tight-stacked. The horizontal variance lives inside
  // each card (banner vs. inline photo, text-block alignment), so the list
  // itself is a plain stack again.
  .case-study-list {
    display: grid;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .case-study-list > li {
    min-width: 0;
    max-width: none;
  }

  .case-study-list > li + li {
    margin-top: 0;
  }
</style>
