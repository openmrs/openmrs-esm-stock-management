import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { URL_STOCK_OPERATIONS } from "../constants";
import { UserContextState } from "../core/api/types/identity/UserContextState";
import * as priv from "../core/privileges";
import RequirePriviledge from "../routes/RequirePriviledge";
import RedirectToStockOperation from "./redirect-to-stock-operation.component";
import StockOperationList from "./stock-operation-list.component";
import { StockOperationsEdit } from "./stock-operations-edit.component";

export interface StockItemsProps {
  userContext: UserContextState;
}

export const StockOperations: React.FC<StockItemsProps> = ({ userContext }) => {
  const currentLocation = useLocation();
  return (
    <div className="row">
      <div className="col-12">
        <Routes>
          <Route
            key="redirect-stock-op-route"
            path={"/redirect/:id"}
            element={
              <RedirectToStockOperation key={`redir-${currentLocation.key}`} />
            }
          />
          ,
          <Route
            key="new-stock-op-route"
            path={"/new/:id"}
            element={
              <RequirePriviledge
                requireAllPrivileges={true}
                privileges={[priv.TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE]}
                userContext={userContext}
              >
                <StockOperationsEdit key={`new-${currentLocation.key}`} />
              </RequirePriviledge>
            }
          />
          <Route
            key="edit-stock-op-route"
            path={"/:id"}
            element={
              <RequirePriviledge
                requireAllPrivileges={false}
                privileges={[
                  priv.APP_STOCKMANAGEMENT_STOCKOPERATIONS,
                  priv.TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE,
                ]}
                userContext={userContext}
              >
                <StockOperationsEdit key={`edit-${currentLocation.key}`} />
              </RequirePriviledge>
            }
          />
          <Route
            key="list-stock-op-route"
            path={"/"}
            element={
              <RequirePriviledge
                requireAllPrivileges={true}
                privileges={[priv.APP_STOCKMANAGEMENT_STOCKOPERATIONS]}
                userContext={userContext}
              >
                <StockOperationList />
              </RequirePriviledge>
            }
          />
          <Route
            key="default-stock-op-route"
            path={"*"}
            element={<Navigate to={URL_STOCK_OPERATIONS} />}
          />
          ,
        </Routes>
      </div>
    </div>
  );
};

export default StockOperations;
