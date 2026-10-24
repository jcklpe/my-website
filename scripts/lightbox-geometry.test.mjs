import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canEnlargeImage,
  imageThumbBounds,
} from '../apps/frontend/utils/lightbox-geometry.ts';

test('resolution gate handles small, equal, large, and hidden presentations', () => {
  const source = { width: 800, height: 600 };
  assert.equal(canEnlargeImage(source, { width: 1000, height: 750 }), false);
  assert.equal(canEnlargeImage(source, source), false);
  assert.equal(canEnlargeImage(source, { width: 400, height: 300 }), true);
  assert.equal(canEnlargeImage(source, { width: 0, height: 0 }), false);
});

test('contain measures the picture rather than its letterbox; cover checks its uncropped scale', () => {
  const source = { width: 800, height: 400 };
  const box = { width: 900, height: 300 };
  assert.equal(canEnlargeImage(source, box, 'contain'), true);
  assert.equal(canEnlargeImage(source, box, 'cover'), false);
  assert.deepEqual(
    imageThumbBounds(source, { ...box, x: 10, y: 20 }, 'contain'),
    { x: 160, y: 20, w: 600 },
  );
});

test('cropped thumbnails carry a clipping rectangle and respect focal position', () => {
  const source = { width: 800, height: 400 };
  const box = { width: 200, height: 200, x: 100, y: 50 };
  assert.deepEqual(imageThumbBounds(source, box, 'cover'), {
    x: 0,
    y: 50,
    w: 400,
    innerRect: { x: -100, y: 0, w: 200, h: 200 },
  });
  assert.deepEqual(imageThumbBounds(source, box, 'cover', '100% 50%'), {
    x: -100,
    y: 50,
    w: 400,
    innerRect: { x: -200, y: 0, w: 200, h: 200 },
  });
});
