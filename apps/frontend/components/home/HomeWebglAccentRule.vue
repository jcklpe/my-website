<script setup lang="ts">
  const canvasElement = ref<HTMLCanvasElement | null>(null);
  const {
    accentRuleSpeed,
    accentRuleStrength,
    accentRuleTexture,
    animateAccentRule,
    lavaThickness,
    lavaLength,
    lavaDispersion,
    lavaParticleReach,
  } = useHomeMotionDebug();
  const transitionState = useFeaturedMediaTransitionState();

  const VERTEX_SHADER = `#version 300 es
    in vec2 aPosition;

    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `#version 300 es
    precision highp float;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uStrength;
    uniform float uMode;
    uniform float uLavaThickness;
    uniform float uLavaLength;
    uniform float uLavaDispersion;
    uniform float uLavaParticleReach;
    uniform vec3 uColor;

    out vec4 outputColor;

    float hash(vec2 point) {
      return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 point) {
      vec2 cell = floor(point);
      vec2 fraction = fract(point);
      fraction = fraction * fraction * (3.0 - 2.0 * fraction);
      return mix(
        mix(hash(cell), hash(cell + vec2(1.0, 0.0)), fraction.x),
        mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), fraction.x),
        fraction.y
      );
    }

    float fbm(vec2 point) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int octave = 0; octave < 5; octave++) {
        value += noise(point) * amplitude;
        point = point * 2.03 + vec2(4.7, 1.9);
        amplitude *= 0.5;
      }
      return value;
    }

    float metaball(vec2 point, vec2 center, vec2 scale, float radius) {
      vec2 delta = (point - center) * scale;
      return radius * radius / (dot(delta, delta) + 0.0025);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution;
      float strength = clamp(uStrength / 3.0, 0.0, 4.0);
      float x = uv.x;
      float center = 0.5;
      float halfWidth = 0.12;

      if (uMode > 3.5) {
        float fluidity = 0.72 + strength * 0.44;
        float lavaHeight = clamp(uLavaThickness, 0.35, 8.0);
        float bodyLength = clamp(uLavaLength, 0.45, 6.0);
        float dispersion = clamp(uLavaDispersion, 0.0, 8.0);
        float particleReach = clamp(uLavaParticleReach, 0.25, 8.0);
        float coreWander = mix(0.45, 1.35, min(dispersion, 2.0) * 0.5);
        float particleRadiusScale = mix(0.72, 1.36, min(lavaHeight, 2.0) * 0.5);
        float field = 0.0;
        vec2 bodyOne = vec2(
          0.09 + sin(uTime * 0.31) * 0.035,
          0.5 + sin(uTime * 0.47 + 0.6) * 0.21 * coreWander
        );
        vec2 bodyTwo = vec2(
          0.09 + (0.23 - 0.09) * bodyLength + cos(uTime * 0.27 + 1.4) * 0.065,
          0.5 + cos(uTime * 0.39) * 0.25 * coreWander
        );
        vec2 bodyThree = vec2(
          0.09 + (0.39 - 0.09) * bodyLength + sin(uTime * 0.23 + 2.2) * 0.075,
          0.5 + sin(uTime * 0.43 + 1.8) * 0.23 * coreWander
        );
        vec2 bodyFour = vec2(
          0.09 + (0.52 - 0.09) * bodyLength + cos(uTime * 0.19 + 0.3) * 0.06,
          0.5 + cos(uTime * 0.36 + 2.7) * 0.19 * coreWander
        );
        field += metaball(uv, bodyOne, vec2(2.2 / bodyLength, 0.82 / lavaHeight), 0.19) * fluidity;
        field += metaball(uv, bodyTwo, vec2(2.35 / bodyLength, 0.78 / lavaHeight), 0.22) * fluidity;
        field += metaball(uv, bodyThree, vec2(2.5 / bodyLength, 0.82 / lavaHeight), 0.2) * fluidity;
        field += metaball(uv, bodyFour, vec2(2.8 / bodyLength, 0.88 / lavaHeight), 0.16) * fluidity;

        vec2 movingOpening = vec2(
          0.31 + sin(uTime * 0.21) * 0.06,
          0.5 + cos(uTime * 0.34) * 0.12
        );
        field -= metaball(
          uv,
          movingOpening,
          vec2(3.1, 1.05),
          0.095
        ) * (0.32 + strength * 0.08);

        float firstPhase = fract(uTime * 0.075);
        float secondPhase = fract(uTime * 0.061 + 0.29);
        float thirdPhase = fract(uTime * 0.052 + 0.58);
        float fourthPhase = fract(uTime * 0.043 + 0.81);
        vec2 firstParticle = vec2(
          bodyFour.x + firstPhase * 0.7 * particleReach,
          0.5 + sin(firstPhase * 6.4 + 0.8) * (0.1 + firstPhase * 0.34) * dispersion
        );
        vec2 secondParticle = vec2(
          bodyFour.x + 0.03 + secondPhase * 0.66 * particleReach,
          0.5 + cos(secondPhase * 5.8 + 1.9) * (0.09 + secondPhase * 0.29) * dispersion
        );
        vec2 thirdParticle = vec2(
          bodyFour.x + 0.06 + thirdPhase * 0.62 * particleReach,
          0.5 + sin(thirdPhase * 7.1 + 3.2) * (0.08 + thirdPhase * 0.3) * dispersion
        );
        vec2 fourthParticle = vec2(
          bodyFour.x + 0.08 + fourthPhase * 0.59 * particleReach,
          0.5 + cos(fourthPhase * 6.7 + 4.4) * (0.08 + fourthPhase * 0.33) * dispersion
        );
        field += metaball(
          uv,
          firstParticle,
          vec2(2.5, 1.0),
          mix(0.18, 0.025, firstPhase) * particleRadiusScale
        ) * fluidity;
        field += metaball(
          uv,
          secondParticle,
          vec2(2.5, 1.0),
          mix(0.15, 0.021, secondPhase) * particleRadiusScale
        ) * fluidity;
        field += metaball(
          uv,
          thirdParticle,
          vec2(2.5, 1.0),
          mix(0.13, 0.018, thirdPhase) * particleRadiusScale
        ) * fluidity;
        field += metaball(
          uv,
          fourthParticle,
          vec2(2.7, 0.9),
          mix(0.11, 0.015, fourthPhase) * particleRadiusScale
        ) * fluidity;

        vec2 stretchingBridge = vec2(
          bodyFour.x + firstPhase * 0.28 * particleReach,
          mix(bodyFour.y, firstParticle.y, firstPhase * 0.72)
        );
        field += metaball(
          uv,
          stretchingBridge,
          vec2(4.8, 0.72),
          mix(0.12, 0.025, firstPhase)
        ) * fluidity;

        float threshold = 1.08;
        float antialias = max(fwidth(field) * 1.2, 0.015);
        float alpha = smoothstep(
          threshold - antialias,
          threshold + antialias,
          field
        );
        if (alpha <= 0.001) discard;
        outputColor = vec4(uColor * alpha, alpha);
        return;
      } else if (uMode > 1.5 && uMode < 2.5) {
        float fluidity = 0.65 + strength * 0.55;
        float field = 0.025 / (pow(uv.y - 0.5, 2.0) + 0.012);
        vec2 firstCenter = vec2(
          0.16 + sin(uTime * 0.17) * 0.07,
          0.48 + sin(uTime * 0.23 + 0.8) * 0.18
        );
        vec2 secondCenter = vec2(
          0.42 + cos(uTime * 0.13 + 1.7) * 0.1,
          0.5 + cos(uTime * 0.19) * 0.22
        );
        vec2 thirdCenter = vec2(
          0.7 + sin(uTime * 0.11 + 2.4) * 0.11,
          0.5 + sin(uTime * 0.21 + 2.1) * 0.2
        );
        vec2 fourthCenter = vec2(
          0.9 + cos(uTime * 0.16 + 0.4) * 0.055,
          0.51 + cos(uTime * 0.15 + 1.3) * 0.16
        );
        field += metaball(uv, firstCenter, vec2(2.6, 1.0), 0.2) * fluidity;
        field += metaball(uv, secondCenter, vec2(2.25, 1.0), 0.24) * fluidity;
        field += metaball(uv, thirdCenter, vec2(2.35, 1.0), 0.23) * fluidity;
        field += metaball(uv, fourthCenter, vec2(2.8, 1.0), 0.19) * fluidity;
        float threshold = 1.1;
        float antialias = max(fwidth(field) * 1.2, 0.015);
        float alpha = smoothstep(threshold - antialias, threshold + antialias, field);
        if (alpha <= 0.001) discard;
        outputColor = vec4(uColor * alpha, alpha);
        return;
      } else if (uMode < 1.5) {
        float broad = fbm(vec2(x * 3.8 + uTime * 0.08, uTime * 0.05));
        float counter = fbm(vec2(x * 9.0 - uTime * 0.11, 8.0 - uTime * 0.04));
        center += ((broad - 0.5) * 0.42 + (counter - 0.5) * 0.18) * strength;
        halfWidth += (fbm(vec2(x * 5.0 + uTime * 0.06, 19.0)) - 0.5) * 0.13 * strength;
      }

      halfWidth = max(0.035, halfWidth);
      float distanceToRibbon = abs(uv.y - center) - halfWidth;
      float antialias = max(fwidth(distanceToRibbon) * 1.35, 1.0 / uResolution.y);
      float alpha = 1.0 - smoothstep(-antialias, antialias, distanceToRibbon);
      if (alpha <= 0.001) discard;
      outputColor = vec4(uColor * alpha, alpha);
    }
  `;

  let context: WebGL2RenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let vertexArray: WebGLVertexArrayObject | null = null;
  let animationFrame = 0;
  let startTime = 0;
  let observer: IntersectionObserver | null = null;
  let reducedMotionQuery: MediaQueryList | null = null;
  let isVisible = true;

  function compileShader(type: number, source: string) {
    if (!context) return null;
    const shader = context.createShader(type);
    if (!shader) return null;
    context.shaderSource(shader, source);
    context.compileShader(shader);
    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
      console.warn('Could not compile the accent-rule shader.');
      context.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram() {
    if (!context) return null;
    const vertexShader = compileShader(context.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(
      context.FRAGMENT_SHADER,
      FRAGMENT_SHADER,
    );
    if (!vertexShader || !fragmentShader) return null;

    const nextProgram = context.createProgram();
    if (!nextProgram) return null;
    context.attachShader(nextProgram, vertexShader);
    context.attachShader(nextProgram, fragmentShader);
    context.linkProgram(nextProgram);
    context.deleteShader(vertexShader);
    context.deleteShader(fragmentShader);
    if (!context.getProgramParameter(nextProgram, context.LINK_STATUS)) {
      console.warn('Could not link the accent-rule shader.');
      context.deleteProgram(nextProgram);
      return null;
    }
    return nextProgram;
  }

  function readPrimaryColor(): [number, number, number] {
    const color = canvasElement.value
      ? window.getComputedStyle(canvasElement.value).color
      : 'rgb(0, 82, 255)';
    const channels = color
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number);
    if (!channels || channels.length < 3) return [0, 0.32, 1];
    return [channels[0]! / 255, channels[1]! / 255, channels[2]! / 255];
  }

  function textureMode() {
    if (accentRuleTexture.value === 'webgl-lava') return 2;
    if (accentRuleTexture.value === 'webgl-lava-shedding') return 4;
    return 1;
  }

  function draw(timestamp = 0) {
    const canvas = canvasElement.value;
    if (!canvas || !context || !program) return;

    const bounds = canvas.getBoundingClientRect();
    const renderScale = Math.min(window.devicePixelRatio * 2, 4);
    const width = Math.max(1, Math.round(bounds.width * renderScale));
    const height = Math.max(1, Math.round(bounds.height * renderScale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const elapsed = startTime ? (timestamp - startTime) / 1000 : 0;
    const [red, green, blue] = readPrimaryColor();
    context.viewport(0, 0, width, height);
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);
    context.useProgram(program);
    context.uniform2f(
      context.getUniformLocation(program, 'uResolution'),
      width,
      height,
    );
    context.uniform1f(
      context.getUniformLocation(program, 'uTime'),
      elapsed * accentRuleSpeed.value,
    );
    context.uniform1f(
      context.getUniformLocation(program, 'uStrength'),
      animateAccentRule.value ? accentRuleStrength.value : 0,
    );
    context.uniform1f(
      context.getUniformLocation(program, 'uMode'),
      textureMode(),
    );
    context.uniform1f(
      context.getUniformLocation(program, 'uLavaThickness'),
      lavaThickness.value,
    );
    context.uniform1f(
      context.getUniformLocation(program, 'uLavaLength'),
      lavaLength.value,
    );
    context.uniform1f(
      context.getUniformLocation(program, 'uLavaDispersion'),
      lavaDispersion.value,
    );
    context.uniform1f(
      context.getUniformLocation(program, 'uLavaParticleReach'),
      lavaParticleReach.value,
    );
    context.uniform3f(
      context.getUniformLocation(program, 'uColor'),
      red,
      green,
      blue,
    );
    context.drawArrays(context.TRIANGLES, 0, 3);
  }

  function stop() {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function tick(timestamp: number) {
    if (!startTime) startTime = timestamp;
    draw(timestamp);
    animationFrame = window.requestAnimationFrame(tick);
  }

  function reconcileMotion() {
    const shouldAnimate =
      animateAccentRule.value &&
      isVisible &&
      !transitionState.value.active &&
      !reducedMotionQuery?.matches;

    if (!shouldAnimate) {
      stop();
      draw();
      return;
    }
    if (!animationFrame) animationFrame = window.requestAnimationFrame(tick);
  }

  onMounted(() => {
    const canvas = canvasElement.value;
    if (!canvas) return;
    context =
      canvas.getContext('webgl2', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
      }) ?? null;
    if (!context) return;

    program = createProgram();
    if (!program) return;
    vertexArray = context.createVertexArray();
    context.bindVertexArray(vertexArray);
    const position = context.getAttribLocation(program, 'aPosition');
    const buffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      context.STATIC_DRAW,
    );
    context.enableVertexAttribArray(position);
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', reconcileMotion);
    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        reconcileMotion();
      },
      { rootMargin: '120px' },
    );
    observer.observe(canvas);
    draw();
    reconcileMotion();
  });

  watch(
    [
      accentRuleSpeed,
      accentRuleStrength,
      accentRuleTexture,
      animateAccentRule,
      lavaThickness,
      lavaLength,
      lavaDispersion,
      lavaParticleReach,
      transitionState,
    ],
    reconcileMotion,
  );

  onBeforeUnmount(() => {
    stop();
    observer?.disconnect();
    reducedMotionQuery?.removeEventListener('change', reconcileMotion);
    if (context && vertexArray) context.deleteVertexArray(vertexArray);
    if (context && program) context.deleteProgram(program);
  });
</script>

<template>
  <canvas ref="canvasElement" class="webgl-rule" aria-hidden="true" />
</template>

<style lang="scss" scoped>
  .webgl-rule {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
    color: var(--color-primary);
    pointer-events: none;
  }
</style>
