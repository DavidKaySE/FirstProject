import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from '../src/App';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: 'https://webhook.site/098d6b4a-d18e-4270-9f78-dc100de099d8',
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PostHogProvider 
        apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY}
        options={options}
      >
        <App />
      </PostHogProvider>
    </Provider>
  </React.StrictMode>
);