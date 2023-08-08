import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { spaBasePath } from "./constants";
import StockHome from "./stock-home.component";
import StockItems from "./stock-items/stock-items.component";
import StockReports from "./stock-reports/stock-reports.component";

const swrConfiguration = {
  // Maximum number of retries when the backend returns an error
  errorRetryCount: 3,
};

const Root: React.FC = () => {
  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={`${spaBasePath}/commodity`}>
          <Routes>
            <Route path="/home/" element={<StockHome />} />
            <Route path="/reports/:value/" element={<StockReports />} />
            <Route path="/items/:value/" element={<StockItems />} />
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
