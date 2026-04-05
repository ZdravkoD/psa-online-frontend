// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

process.env.REACT_APP_API_BASE_URL = 'https://api.example.test';
process.env.REACT_APP_PUBSUB_URL = 'wss://pubsub.example.test';
