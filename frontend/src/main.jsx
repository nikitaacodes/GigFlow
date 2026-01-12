import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { loadUser } from './store/slices/authSlice';
import App from './App.jsx';
import './index.css';

// Load user on app initialization
store.dispatch(loadUser());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
