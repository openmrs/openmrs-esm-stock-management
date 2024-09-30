import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { setLeftNav, unsetLeftNav } from '@openmrs/esm-framework';
import Dashboard from './dashboard/home-dashboard.component';

const Root: React.FC = () => {
  const spaBasePath = `${window.spaBase}/stock-management`;

  useEffect(() => {
    setLeftNav({ name: 'stock-page-dashboard-slot', basePath: spaBasePath });
    return () => unsetLeftNav('stock-page-dashboard-slot');
  }, [spaBasePath]);

  return (
    <main className="omrs-main-content">
      <BrowserRouter basename={window.spaBase}>
        <Routes>
          <Route path="/stock-management" element={<Dashboard />} />
          <Route path="/stock-management/:dashboard/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default Root;
