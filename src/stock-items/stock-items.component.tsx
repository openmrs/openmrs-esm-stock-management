import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { URL_STOCK_ITEMS } from "../constants";
import { UserContextState } from "../core/api/types/identity/UserContextState";
import { APP_STOCKMANAGEMENT_STOCKITEMS, TASK_STOCKMANAGEMENT_STOCKITEMS_MUTATE } from '../core/privileges';
import RequirePriviledge from "../routes/RequirePriviledge";
import RedirectToStockItem from "./redirect-to-stock-item.component";
import StockItemList from './stock-Item-list.component';
import { Edit } from "./stock-item-edit";

export interface StockItemsProps {
    userContext: UserContextState
}

export const StockItems: React.FC<StockItemsProps> = ({
    userContext
}) => {
    const currentLocation = useLocation();
    return <div className="row">
        <div className="col-12">
            <Routes>
                <Route key="redirect-stock-item-route" path={"/redirect/:id"} element={<RedirectToStockItem key={`redir-${currentLocation.key}`} />} />,
                <Route key="new-stock-items-route" path={"/new"} element={<RequirePriviledge requireAllPrivileges={true} privileges={[TASK_STOCKMANAGEMENT_STOCKITEMS_MUTATE]} userContext={userContext}><Edit key={`new-${currentLocation.key}`} /></RequirePriviledge>} />
                <Route key="edit-stock-items-route" path={"/:id"} element={<RequirePriviledge requireAllPrivileges={false} privileges={[APP_STOCKMANAGEMENT_STOCKITEMS, TASK_STOCKMANAGEMENT_STOCKITEMS_MUTATE]} userContext={userContext}><Edit key={`edit-${currentLocation.key}`} /></RequirePriviledge>} />
                <Route key="list-stock-items-route" path={"/"} element={<RequirePriviledge requireAllPrivileges={true} privileges={[APP_STOCKMANAGEMENT_STOCKITEMS]} userContext={userContext}><StockItemList /></RequirePriviledge>} />
                <Route key="default-stock-items-route" path={"*"} element={<Navigate to={URL_STOCK_ITEMS} />} />,
            </Routes>
        </div>
    </div>
}

export default StockItems;