import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext.jsx';
import { PantryProvider } from './context/PantryContext';
import './styles.css';
import logoIcon from './assets/icon.png';

document.title = 'PantryPal';

const existingIcon = document.querySelector('link[rel="icon"]');

if (existingIcon) {
  existingIcon.setAttribute('href', logoIcon);
} else {
  const iconLink = document.createElement('link');
  iconLink.rel = 'icon';
  iconLink.type = 'image/png';
  iconLink.href = logoIcon;
  document.head.appendChild(iconLink);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PantryProvider>
          <App />
        </PantryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);