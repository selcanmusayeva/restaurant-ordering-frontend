import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { fetchCurrentUser } from './store/slices/authSlice';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Check if token exists and fetch user data
if (localStorage.getItem('token')) {
  console.log('Token found, fetching user data...');
  store.dispatch(fetchCurrentUser())
    .then((result) => {
      console.log('User data fetch result:', result);
    })
    .catch((error) => {
      console.error('Error fetching user data:', error);
    });
}

// Subscribe to store changes for debugging
store.subscribe(() => {
  const state = store.getState();
  console.log('Auth state:', {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    hasToken: !!state.auth.token
  });
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
