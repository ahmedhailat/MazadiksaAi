import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Add this import
import { AuthProvider } from './hooks/useAuth'; // Adjust path as needed

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
