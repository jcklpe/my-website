<script setup lang="ts">
  import ReactionDiffusionPatch from '~/components/content/ReactionDiffusionPatch.vue';

  const transitionState = useFeaturedMediaTransitionState();
  const organismsActive = ref(!transitionState.value.active);
  let resumeTimer = 0;

  watch(
    () => transitionState.value.active,
    (active) => {
      window.clearTimeout(resumeTimer);
      if (active) {
        organismsActive.value = false;
        return;
      }

      resumeTimer = window.setTimeout(() => {
        organismsActive.value = true;
      }, 600);
    },
  );

  onBeforeUnmount(() => window.clearTimeout(resumeTimer));
</script>

<template>
  <div class="margin-organisms" aria-hidden="true">
    <div class="patch first">
      <ReactionDiffusionPatch
        mode="organism"
        :active="organismsActive"
        :columns="240"
        :rows="368"
        :warmup-steps="0"
        :step-ms="38"
        interactive
      />
    </div>
    <div class="patch second">
      <ReactionDiffusionPatch
        mode="organism"
        :active="organismsActive"
        :columns="240"
        :rows="368"
        :warmup-steps="0"
        :step-ms="42"
        interactive
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .margin-organisms {
    position: absolute;
    inset: 0;
    z-index: 3;
    overflow: clip;
    pointer-events: none;
  }

  .patch {
    position: absolute;
    width: clamp(16rem, 22vw, 22rem);
    height: clamp(25rem, 36vw, 34rem);
    opacity: 1;
  }

  .first {
    top: 12rem;
    left: 1rem;
  }

  .second {
    right: 1rem;
    bottom: 8%;
  }

  @media (max-width: 1199px) {
    .margin-organisms {
      display: none;
    }
  }
</style>
