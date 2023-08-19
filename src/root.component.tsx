import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { spaBasePath } from "./constants";
import { SWRConfig } from "swr";
import StockItems from "./stock-items/stock-items.component";

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
            <Route path="/" element={<StockItems />} />
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
