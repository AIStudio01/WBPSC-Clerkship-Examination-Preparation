import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure window.fetch remains assignable in case a browser extension wraps it after load
try {
  const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (desc && desc.get && !desc.set && desc.configurable) {
    let currentFetch = window.fetch.bind(window);
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get: () => currentFetch,
      set: (fn) => {
        if (typeof fn === 'function') currentFetch = fn;
      },
    });
  }
} catch {
  // Ignore if non-configurable
}

createRoot(document.getElementById('root')!).render(<App />);

