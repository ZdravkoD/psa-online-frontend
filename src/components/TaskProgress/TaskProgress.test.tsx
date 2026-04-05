import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import TaskProgress from './TaskProgress';
import outputReducer from '../../store/tasks';
import initDataReducer from '../../store/initData';
import { Task } from '../../types/task';
import * as apiClient from '../../api/client';

jest.mock('../../api/client');
jest.mock('../../hooks/useFetchInitData', () => () => ({
  pharmacies: [{ pharmacy_id: 'pharmacy-1', display_name: 'Central' }],
  distributors: [{ name: 'sting', display_name: 'Sting' }],
  fetchInitDataLoading: false,
  fetchInitDataError: null,
}));
jest.mock('./BoughtProductsTable', () => () => 'BoughtProductsTable');
jest.mock('./UnboughtProductsTable', () => () => 'UnboughtProductsTable');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ taskId: 'task-1' }),
}));
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    sheet_add_json: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

const mockedApiGet = apiClient.apiGet as jest.MockedFunction<typeof apiClient.apiGet>;
const mockedApiGetBlob = apiClient.apiGetBlob as jest.MockedFunction<typeof apiClient.apiGetBlob>;
const mockedApiPost = apiClient.apiPost as jest.MockedFunction<typeof apiClient.apiPost>;
const mockedBuildApiUrl = apiClient.buildApiUrl as jest.MockedFunction<typeof apiClient.buildApiUrl>;

const failedTask: Task = {
  id: 'task-1',
  account_id: 'account-1',
  file_name: 'failed-task.xlsx',
  pharmacy_id: 'pharmacy-1',
  distributors: ['sting', 'phoenix'],
  task_type: 'order',
  date_created: '2024-10-18T10:00:00.000Z',
  date_updated: '2024-10-18T10:01:00.000Z',
  status: {
    status: 'error',
    message: 'Неуспешно завършване на задачата!',
    progress: 0,
    detailed_error_message: 'backend failed',
  },
  report: {
    bought_products: [],
    unbought_products: [],
  },
  image_urls: null,
};

function renderTaskProgress() {
  const store = configureStore({
    reducer: {
      output: outputReducer,
      initData: initDataReducer,
    },
    preloadedState: {
      output: {
        data: {
          [failedTask.id]: failedTask,
        },
      },
      initData: {
        pharmacies: [{ pharmacy_id: 'pharmacy-1', display_name: 'Central' }],
        distributors: [{ name: 'sting', display_name: 'Sting' }],
        status: 'succeeded',
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <TaskProgress />
    </Provider>
  );
}

beforeEach(() => {
  mockedApiGet.mockResolvedValue(failedTask);
  mockedApiGetBlob.mockResolvedValue(new Blob(['file-content']));
  mockedApiPost.mockResolvedValue({ id: 'task-2' });
  mockedBuildApiUrl.mockImplementation((path) => `https://api.example.test${path}`);
  Object.defineProperty(window, 'location', {
    value: { href: 'http://localhost/' },
    writable: true,
  });
});

test('retries a failed task by recreating it from the original file', async () => {
  renderTaskProgress();

  fireEvent.click(await screen.findByRole('button', { name: 'Опитай отново' }));

  await waitFor(() => {
    expect(mockedApiGetBlob).toHaveBeenCalledWith('/input-file/failed-task.xlsx');
    expect(mockedApiPost).toHaveBeenCalledWith('/task', expect.any(FormData));
  });

  const formData = mockedApiPost.mock.calls[0][1] as FormData;

  expect(formData.get('pharmacy_id')).toBe('pharmacy-1');
  expect(formData.get('distributors')).toBe('["sting","phoenix"]');
  expect((formData.get('file') as File).name).toBe('failed-task.xlsx');
  expect(window.location.href).toBe('/task-progress/task-2');
});
