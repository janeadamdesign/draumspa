// Package Imports
import React from 'react';
import ReactDOM from 'react-dom/client';

// Local imports
import DraumSpaLanding from "./DraumSpaLanding";


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <DraumSpaLanding />
  </React.StrictMode>
);

