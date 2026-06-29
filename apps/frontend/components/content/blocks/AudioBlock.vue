<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    addMediaPreloadDefaultsToHtml,
    decodeHtmlEntities,
    extractAttribute,
    extractFigcaptionHtml,
    extractFirstElementHtml,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  interface AudioSource {
    src: string;
    type: string;
  }

  interface ParsedAudio {
    src: string;
    preload: string;
    loop: boolean;
    muted: boolean;
    sources: AudioSource[];
  }

  const audioElement = ref<HTMLAudioElement | null>(null);
  const isEnhanced = ref(false);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const isWaiting = ref(false);
  const hasError = ref(false);

  const audio = computed(() =>
    extractRootElement(props.block.renderedHtml, 'figure'),
  );
  const figureClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(audio.value?.attributes, 'class'),
    ),
  );
  const audioHtml = computed(() =>
    addMediaPreloadDefaultsToHtml(
      extractFirstElementHtml(audio.value?.innerHtml ?? '', 'audio'),
    ),
  );
  const captionHtml = computed(() =>
    extractFigcaptionHtml(audio.value?.innerHtml),
  );
  const parsedAudio = computed(() => parseAudioHtml(audioHtml.value));
  const canEnhance = computed(
    () =>
      Boolean(parsedAudio.value?.src) ||
      Boolean(parsedAudio.value?.sources.length),
  );
  const canSeek = computed(
    () => Number.isFinite(duration.value) && duration.value > 0,
  );
  const progressPercent = computed(() => {
    if (!canSeek.value) {
      return '0%';
    }

    return `${Math.min((currentTime.value / duration.value) * 100, 100)}%`;
  });
  const playPauseLabel = computed(() =>
    isPlaying.value ? 'Pause audio' : 'Play audio',
  );
  const audioSourceUrl = computed(
    () => parsedAudio.value?.src || parsedAudio.value?.sources[0]?.src || '',
  );
  const statusText = computed(() => {
    if (hasError.value) {
      return 'Audio unavailable';
    }

    if (isWaiting.value) {
      return 'Loading';
    }

    return null;
  });

  onMounted(() => {
    isEnhanced.value = canEnhance.value;
  });

  watch(audioHtml, () => {
    resetPlaybackState();
    isEnhanced.value = canEnhance.value;
  });

  function parseAudioHtml(html: string): ParsedAudio | null {
    const audioTagMatch = html.match(/<audio\b([^>]*)>/i);

    if (!audioTagMatch) {
      return null;
    }

    const attributes = audioTagMatch[1] ?? '';
    const sources = Array.from(html.matchAll(/<source\b([^>]*)\/?>/gi))
      .map((match) => {
        const sourceAttributes = match[1] ?? '';
        const src = decodeHtmlEntities(extractAttribute(sourceAttributes, 'src'));

        if (!src) {
          return null;
        }

        return {
          src,
          type: extractAttribute(sourceAttributes, 'type'),
        };
      })
      .filter((source): source is AudioSource => Boolean(source));

    return {
      src: decodeHtmlEntities(extractAttribute(attributes, 'src')),
      preload: extractAttribute(attributes, 'preload') || 'metadata',
      loop: hasBooleanAttribute(attributes, 'loop'),
      muted: hasBooleanAttribute(attributes, 'muted'),
      sources,
    };
  }

  function hasBooleanAttribute(attributes: string, attributeName: string) {
    const safeAttributeName = attributeName.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      '\\$&',
    );
    const attributePattern = new RegExp(
      `(?:^|\\s)${safeAttributeName}(?:\\s*=|\\s|$)`,
      'i',
    );

    return attributePattern.test(attributes);
  }

  async function togglePlayback() {
    const audioNode = audioElement.value;

    if (!audioNode || hasError.value) {
      return;
    }

    if (audioNode.paused) {
      try {
        await audioNode.play();
      } catch {
        hasError.value = true;
      }

      return;
    }

    audioNode.pause();
  }

  function updateMediaState() {
    const audioNode = audioElement.value;

    if (!audioNode) {
      return;
    }

    const nextDuration = Number.isFinite(audioNode.duration)
      ? audioNode.duration
      : 0;
    const nextCurrentTime = audioNode.ended
      ? nextDuration
      : audioNode.currentTime || 0;

    currentTime.value = nextCurrentTime;
    duration.value = nextDuration;
    isPlaying.value = !audioNode.paused;
  }

  function updateWaitingState(nextState: boolean) {
    isWaiting.value = nextState;
  }

  function handleError() {
    hasError.value = true;
    isWaiting.value = false;
    isPlaying.value = false;
  }

  function handleSeek(event: Event) {
    const audioNode = audioElement.value;
    const input = event.target as HTMLInputElement | null;

    if (!audioNode || !input || !canSeek.value) {
      return;
    }

    audioNode.currentTime = Number(input.value);
    currentTime.value = audioNode.currentTime;
  }

  function resetPlaybackState() {
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    isWaiting.value = false;
    hasError.value = false;
  }

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return '0:00';
    }

    const wholeSeconds = Math.floor(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = wholeSeconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
</script>

<template>
  <figure
    v-if="audio"
    class="audio-block"
    :class="figureClass"
  >
    <div
      v-if="!isEnhanced || !parsedAudio"
      class="audio-frame"
      v-html="audioHtml"
    />
    <div
      v-else
      class="custom-audio-player"
      :class="{ 'is-loading': isWaiting, 'has-error': hasError }"
      :style="{ '--audio-progress': progressPercent }"
    >
      <audio
        ref="audioElement"
        class="audio-engine"
        :src="parsedAudio.src || undefined"
        :preload="parsedAudio.preload"
        :loop="parsedAudio.loop"
        :muted="parsedAudio.muted"
        @loadedmetadata="updateMediaState"
        @durationchange="updateMediaState"
        @timeupdate="updateMediaState"
        @play="updateMediaState"
        @pause="updateMediaState"
        @ended="updateMediaState"
        @waiting="updateWaitingState(true)"
        @canplay="updateWaitingState(false)"
        @error="handleError"
      >
        <source
          v-for="source in parsedAudio.sources"
          :key="`${source.src}:${source.type}`"
          :src="source.src"
          :type="source.type || undefined"
        >
      </audio>

      <button
        class="play-button"
        :class="{ 'is-playing': isPlaying }"
        type="button"
        :aria-label="playPauseLabel"
        :disabled="hasError"
        @click="togglePlayback"
      >
        <span class="play-icon" aria-hidden="true" />
      </button>

      <div class="progress-group">
        <div class="progress-shell">
          <input
            class="progress-control"
            type="range"
            min="0"
            :max="duration || 0"
            step="0.1"
            :value="currentTime"
            :disabled="!canSeek || hasError"
            aria-label="Audio playback position"
            @input="handleSeek"
          >
        </div>
        <div class="time-readout" aria-live="off">
          <span>{{ formatTime(currentTime) }}</span>
          <span aria-hidden="true">/</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <p
        v-if="statusText"
        class="audio-status"
      >
        <template v-if="hasError && audioSourceUrl">
          Audio unavailable.
          <a :href="audioSourceUrl">Open audio file.</a>
        </template>
        <template v-else>
          {{ statusText }}
        </template>
      </p>
    </div>
    <figcaption v-if="captionHtml" v-html="captionHtml" />
  </figure>
</template>

<style scoped lang="scss">
  .audio-block {
    @include audio-block-shell;
  }
</style>
