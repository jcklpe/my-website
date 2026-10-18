// Sampled left to right from the supplied gradient; each entrance settles into the text's own resting color.
export const sneakersColors = [
  '#e7de71',
  '#f3c661',
  '#e77f70',
  '#651523',
  '#84f9fb',
  '#2e321a',
  '#6be77d',
  '#1b4529',
];

export const sneakersAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=?';

export function sneakersColorFrames(restingColor: string): Keyframe[] {
  return [
    ...sneakersColors.map((color, index) => ({
      color,
      opacity: index === 0 ? 0 : 1,
    })),
    { color: restingColor, opacity: 1 },
  ];
}
