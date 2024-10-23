import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from '../src/App';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <PostHogProvider 
      apiKey={import.meta.env.VITE_POSTHOG_KEY}
      options={options}
    >
      <Provider store={store}>
        <App />
      </Provider>
    </PostHogProvider>
  </React.StrictMode>
);
