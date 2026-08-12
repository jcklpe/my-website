<template>
  <svg
    width="0"
    height="0"
    style="position: absolute; pointer-events: none"
    aria-hidden="true"
  >
    <defs>
      <filter id="halftone-tone-ink-cream" color-interpolation-filters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.047 0.969" />
          <feFuncG type="table" tableValues="0.067 0.961" />
          <feFuncB type="table" tableValues="0.169 0.937" />
        </feComponentTransfer>
      </filter>
      <filter id="halftone-tone-blue-cream" color-interpolation-filters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.149 0.969" />
          <feFuncG type="table" tableValues="0.341 0.961" />
          <feFuncB type="table" tableValues="0.922 0.937" />
        </feComponentTransfer>
      </filter>
      <filter id="halftone-tone-ink-blue" color-interpolation-filters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.047 0.149" />
          <feFuncG type="table" tableValues="0.067 0.341" />
          <feFuncB type="table" tableValues="0.169 0.922" />
        </feComponentTransfer>
      </filter>
      <filter
        id="halftone-tone-tritone-ink-blue-cream"
        color-interpolation-filters="sRGB"
      >
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.047 0.149 0.969" />
          <feFuncG type="table" tableValues="0.067 0.341 0.961" />
          <feFuncB type="table" tableValues="0.169 0.922 0.937" />
        </feComponentTransfer>
      </filter>
      <filter
        id="halftone-tone-tritone-ink-soft-cream"
        color-interpolation-filters="sRGB"
      >
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.047 0.863 0.969" />
          <feFuncG type="table" tableValues="0.067 0.886 0.961" />
          <feFuncB type="table" tableValues="0.169 0.973 0.937" />
        </feComponentTransfer>
      </filter>
      <filter
        id="halftone-tone-crisp-ink-cream"
        color-interpolation-filters="sRGB"
      >
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0.047 0.969" />
          <feFuncG type="discrete" tableValues="0.067 0.961" />
          <feFuncB type="discrete" tableValues="0.169 0.937" />
        </feComponentTransfer>
      </filter>
      <filter
        id="halftone-tone-crisp-blue-cream"
        color-interpolation-filters="sRGB"
      >
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0.149 0.969" />
          <feFuncG type="discrete" tableValues="0.341 0.961" />
          <feFuncB type="discrete" tableValues="0.922 0.937" />
        </feComponentTransfer>
      </filter>
      <filter
        id="halftone-tone-crisp-ink-blue"
        color-interpolation-filters="sRGB"
      >
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0.047 0.149" />
          <feFuncG type="discrete" tableValues="0.067 0.341" />
          <feFuncB type="discrete" tableValues="0.169 0.922" />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
</template>
