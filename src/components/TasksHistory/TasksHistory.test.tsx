import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import TasksHistory from './TasksHistory';
import * as apiClient from '../../api/client';

jest.mock('../../api/client');

const mockNavigate = jest.fn();

jest.mock('../../hooks/useFetchInitData', () => () => ({
  pharmacies: [{ pharmacy_id: 'pharmacy-1', display_name: 'Central' }],
  fetchInitDataLoading: false,
  fetchInitDataError: null,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockedApiGet = apiClient.apiGet as jest.MockedFunction<typeof apiClient.apiGet>;

beforeEach(() => {
  mockedApiGet.mockResolvedValue([
    {
      id: 'task-1',
      file_name: 'history-task.xlsx',
      file_data: '',
      pharmacy_id: 'pharmacy-1',
      distributors: ['sting'],
      task_type: 'order',
      status: {
        status: 'success',
        message: 'done',
      },
      report: {},
      date_created: '2024-10-18T10:00:00.000Z',
      date_updated: '2024-10-18T10:01:05.000Z',
    },
  ]);
  mockNavigate.mockReset();
});

test('requests updated timestamps and renders task duration in history', async () => {
  render(<TasksHistory />);

  expect(await screen.findByText('history-task.xlsx')).toBeInTheDocument();
  expect(screen.getByText('Продължителност')).toBeInTheDocument();
  expect(screen.getByText('1 мин 5 сек')).toBeInTheDocument();

  await waitFor(() => {
    expect(mockedApiGet).toHaveBeenCalledWith('/tasks', {
      skip: 0,
      limit: 30,
      sort: '{"date_created":-1}',
      projection: '{"id":1,"file_name":1,"status":1,"pharmacy_id":1,"date_created":1,"date_updated":1}',
    });
  });
});
