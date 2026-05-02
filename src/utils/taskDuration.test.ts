import {
  formatDuration,
  formatTaskDuration,
  getTaskDurationMs,
} from './taskDuration';

test('calculates duration in milliseconds from created and updated dates', () => {
  expect(
    getTaskDurationMs('2024-10-18T10:00:00.000Z', '2024-10-18T10:01:01.000Z')
  ).toBe(61000);
});

test('formats short durations in a readable way', () => {
  expect(formatDuration(61000)).toBe('1 мин 1 сек');
  expect(formatDuration(0)).toBe('под 1 сек');
});

test('formats long durations with all non-zero units', () => {
  const durationMs =
    (((1 * 24 + 2) * 60 + 3) * 60 + 4) * 1000;

  expect(formatDuration(durationMs)).toBe('1 д 2 ч 3 мин 4 сек');
});

test('returns null for invalid or reversed task timestamps', () => {
  expect(formatTaskDuration('invalid', '2024-10-18T10:01:00.000Z')).toBeNull();
  expect(
    formatTaskDuration('2024-10-18T10:01:00.000Z', '2024-10-18T10:00:00.000Z')
  ).toBeNull();
});
