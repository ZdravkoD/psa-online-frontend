import { apiGetText, buildApiUrl } from './client';

test('buildApiUrl appends query params to the configured api base url', () => {
  expect(
    buildApiUrl('/products', {
      limit: 10,
      filter: '{"original_product_name":"Aspirin"}',
    })
  ).toBe(
    'https://api.example.test/products?limit=10&filter=%7B%22original_product_name%22%3A%22Aspirin%22%7D'
  );
});

test('apiGetText surfaces response details for failed requests', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    text: jest.fn().mockResolvedValue('backend exploded'),
  }) as jest.Mock;

  await expect(apiGetText('/pubsub-token')).rejects.toThrow(
    '500: backend exploded'
  );
});
