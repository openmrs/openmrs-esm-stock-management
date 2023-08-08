import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { URL_STOCK_SOURCES_ROUTES } from "../constants";
import { UserContextState } from "../core/api/types/identity/UserContextState";
import { APP_STOCKMANAGEMENT_STOCKSOURCES } from '../core/privileges';
import RequirePriviledge from "../routes/RequirePriviledge";
import StockSourcesList from './stock-source-list.component';
export interface StockSourcesProps {
    userContext: UserContextState
}

export const StockSources: React.FC<StockSourcesProps> = ({
    userContext
}) => {
    return <div className="row">
        <div className="col-12">
            <Routes>
                <Route key="list-user-role-scopes-route" path={"/"} element={<RequirePriviledge requireAllPrivileges={true} privileges={[APP_STOCKMANAGEMENT_STOCKSOURCES]} userContext={userContext}><StockSourcesList /></RequirePriviledge>} />
                <Route key="default-user-role-scopes-route" path={"*"} element={<Navigate to={URL_STOCK_SOURCES_ROUTES} />} />,
            </Routes>
        </div>
    </div>
}

export default StockSources;