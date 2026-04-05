import reducer, { fetchInitData } from './initData';

test('stores fetched pharmacies and distributors', () => {
  const nextState = reducer(
    undefined,
    fetchInitData.fulfilled(
      {
        pharmacies: [{ pharmacy_id: 'pharmacy-1', display_name: 'Central' }],
        distributors: [{ name: 'sting', display_name: 'Sting' }],
      },
      'request-id'
    )
  );

  expect(nextState.status).toBe('succeeded');
  expect(nextState.pharmacies).toEqual([
    { pharmacy_id: 'pharmacy-1', display_name: 'Central' },
  ]);
  expect(nextState.distributors).toEqual([
    { name: 'sting', display_name: 'Sting' },
  ]);
});

test('stores fetch errors in shared init-data state', () => {
  const nextState = reducer(
    undefined,
    fetchInitData.rejected(new Error('network failed'), 'request-id')
  );

  expect(nextState.status).toBe('failed');
  expect(nextState.error).toBe('network failed');
});
