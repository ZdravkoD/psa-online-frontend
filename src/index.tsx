// src/index.tsx
import React from 'react';
import { Container, createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './utils/reportWebVitals';
import store from './store/store';
import { Provider } from 'react-redux';

// Create a root.
const container: Container | null = document.getElementById('root');
if (container) {
  const root = createRoot(container); // createRoot(container!) if you're sure 'root' is non-null

  // Initial render: Render the app in the root.
  root.render(
    <Provider store={store}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Provider>
  );
} else {
  console.error('Root container not found');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();