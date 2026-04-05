import { groupTaskImages } from './taskImages';

test('groups task images by provider and preserves time order', () => {
  const result = groupTaskImages([
    'https://example.test/output/2026.04.05_13.44.31_PhoenixPharmaOptimized_ScreenshotOnException.png',
    'https://example.test/output/2026.04.05_13.44.30_StingPharma_TemporaryScreenshot.png',
    'https://example.test/output/2026.04.05_13.44.31_StingPharma_ScreenshotOnException.png',
  ]);

  expect(result.orderedImages.map((image) => image.provider)).toEqual([
    'Sting',
    'Phoenix',
    'Sting',
  ]);
  expect(result.firstImage?.capturedAtLabel).toBe('2026-04-05 13:44:30');
  expect(result.lastImage?.provider).toBe('Sting');
  expect(result.groups.map((group) => group.provider)).toEqual([
    'Sting',
    'Phoenix',
  ]);
  expect(result.groups[0].images.map((image) => image.kind)).toEqual([
    'TemporaryScreenshot',
    'ScreenshotOnException',
  ]);
});
