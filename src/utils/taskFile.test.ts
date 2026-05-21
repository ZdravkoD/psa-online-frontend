import { getTaskInputFileApiPath, getTaskInputFileKey } from './taskFile';

test('extracts the blob object key from file_data URLs', () => {
  const fileData =
    'https://psaonlinestorage.blob.core.windows.net/input-files/74c58c07eb0141caa25fa2fed8b97121_kp-z-15-ph.xlsx';

  expect(getTaskInputFileKey(fileData, 'kp-z-15-ph.xlsx')).toBe(
    '74c58c07eb0141caa25fa2fed8b97121_kp-z-15-ph.xlsx'
  );
  expect(getTaskInputFileApiPath(fileData, 'kp-z-15-ph.xlsx')).toBe(
    '/input-file/74c58c07eb0141caa25fa2fed8b97121_kp-z-15-ph.xlsx'
  );
});

test('falls back to file_name when file_data is missing', () => {
  expect(getTaskInputFileApiPath(null, 'kp-z-15-ph.xlsx')).toBe(
    '/input-file/kp-z-15-ph.xlsx'
  );
});

test('handles non-url file_data values', () => {
  expect(
    getTaskInputFileApiPath(
      'input-files/74c58c07eb0141caa25fa2fed8b97121_kp-z-15-ph.xlsx',
      'kp-z-15-ph.xlsx'
    )
  ).toBe('/input-file/74c58c07eb0141caa25fa2fed8b97121_kp-z-15-ph.xlsx');
});
