export interface ImageSize {
  width: number;
  height: number;
}

export function canEnlargeImage(
  source: ImageSize,
  box: ImageSize,
  fit = 'contain',
) {
  if (
    source.width <= 0 ||
    source.height <= 0 ||
    box.width <= 0 ||
    box.height <= 0
  )
    return false;
  const ratios = [box.width / source.width, box.height / source.height];
  const scale =
    fit === 'contain' || fit === 'scale-down'
      ? Math.min(...ratios)
      : Math.max(...ratios);
  // One pixel of tolerance avoids toggling affordances at a fractional layout boundary.
  return scale < 1 - 1 / Math.max(source.width, source.height);
}

export function imageThumbBounds(
  source: ImageSize,
  box: ImageSize & { x: number; y: number },
  fit: string,
  position = '50% 50%',
) {
  if (!source.width || !source.height || !box.width || !box.height)
    return undefined;
  const scale =
    fit === 'cover'
      ? Math.max(box.width / source.width, box.height / source.height)
      : Math.min(box.width / source.width, box.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  const positions = position.split(/\s+/);
  function offset(space: number, value = '50%') {
    if (value.endsWith('%')) return (space * Number.parseFloat(value)) / 100;
    if (value.endsWith('px')) return Number.parseFloat(value);
    return space / 2;
  }
  const x = offset(box.width - width, positions[0]);
  const y = offset(box.height - height, positions[1]);
  return {
    x: box.x + x,
    y: box.y + y,
    w: width,
    ...(fit === 'cover'
      ? { innerRect: { x, y, w: box.width, h: box.height } }
      : {}),
  };
}

export function getImageContentBox(
  image: HTMLImageElement,
  transformed = true,
) {
  const rect = image.getBoundingClientRect();
  const style = getComputedStyle(image);
  const inset = (edge: string) =>
    Number.parseFloat(style.getPropertyValue(`border-${edge}-width`)) +
    Number.parseFloat(style.getPropertyValue(`padding-${edge}`));
  const left = inset('left');
  const top = inset('top');
  const scaleX =
    transformed && image.offsetWidth ? rect.width / image.offsetWidth : 1;
  const scaleY =
    transformed && image.offsetHeight ? rect.height / image.offsetHeight : 1;
  return {
    x: rect.left + left * scaleX,
    y: rect.top + top * scaleY,
    width: (image.offsetWidth - left - inset('right')) * scaleX,
    height: (image.offsetHeight - top - inset('bottom')) * scaleY,
  };
}
