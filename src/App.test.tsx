import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import outputReducer from './store/tasks';
import { Task } from './types/task';
import useAzurePubSubSocket from './hooks/useAzurePubSubSocket';

jest.mock('./hooks/useAzurePubSubSocket');
jest.mock('./components/PsaForm/PsaForm', () => () => 'Psa Form');
jest.mock('./components/TaskProgress/TaskProgress', () => () => 'Task Progress');
jest.mock('./components/TasksHistory/TasksHistory', () => () => 'Tasks History');
jest.mock('./components/ProductDictionary/ProductDictionary', () => () => 'Product Dictionary');

const mockedUseAzurePubSubSocket = useAzurePubSubSocket as jest.MockedFunction<
  typeof useAzurePubSubSocket
>;

const socketTask: Task = {
  id: 'task-123',
  account_id: 'account-1',
  file_name: 'task.xlsx',
  pharmacy_id: 'pharmacy-1',
  distributors: ['Sting'],
  task_type: 'order',
  date_created: '2024-10-18T10:00:00.000Z',
  date_updated: '2024-10-18T10:01:00.000Z',
  status: {
    status: 'success',
    message: 'done',
    progress: 100,
    detailed_error_message: null,
  },
  report: {
    bought_products: [],
    unbought_products: [],
  },
  image_urls: null,
};

function renderApp() {
  const store = configureStore({
    reducer: {
      output: outputReducer,
    },
  });

  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

beforeEach(() => {
  mockedUseAzurePubSubSocket.mockReturnValue({
    task: null,
    wsError: null,
  });
});

test('renders the home page on the default route', () => {
  const view = renderApp();

  expect(
    screen.getByText('Добре дошли в Pharmacy Stock Automation!')
  ).toBeInTheDocument();
  expect(view.container).toBeTruthy();
});

test('shows websocket errors returned by the socket hook', () => {
  mockedUseAzurePubSubSocket.mockReturnValue({
    task: null,
    wsError: 'Socket disconnected',
  });

  renderApp();

  expect(screen.getByText('Socket disconnected')).toBeInTheDocument();
});

test('stores task updates received from the websocket hook', () => {
  mockedUseAzurePubSubSocket.mockReturnValue({
    task: socketTask,
    wsError: null,
  });

  const store = configureStore({
    reducer: {
      output: outputReducer,
    },
  });

  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(store.getState().output.data[socketTask.id]).toEqual(socketTask);
});
