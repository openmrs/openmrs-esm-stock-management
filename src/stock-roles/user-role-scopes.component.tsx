import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { URL_USER_ROLE_SCOPES } from "../constants";
import { UserContextState } from "../core/api/types/identity/UserContextState";
import { APP_STOCKMANAGEMENT_USERROLESCOPES, TASK_STOCKMANAGEMENT_USERROLESCOPES_MUTATE } from '../core/privileges';
import RequirePriviledge from "../routes/RequirePriviledge";
import { Edit } from './edit.component';
import UserRoleScopeList from './user-role-scope-list.component';

export interface UserRoleScopesProps {
    userContext: UserContextState
}

export const UserRoleScopes: React.FC<UserRoleScopesProps> = ({
    userContext
}) => {
    return <div className="row">
        <div className="col-12">
            <Routes>
                <Route key="new-user-role-scopes-route" path={"/new"} element={<RequirePriviledge requireAllPrivileges={true} privileges={[TASK_STOCKMANAGEMENT_USERROLESCOPES_MUTATE]} userContext={userContext}><Edit /></RequirePriviledge>} />
                <Route key="edit-user-role-scopes-route" path={"/:id"} element={<RequirePriviledge requireAllPrivileges={true} privileges={[TASK_STOCKMANAGEMENT_USERROLESCOPES_MUTATE]} userContext={userContext}><Edit /></RequirePriviledge>} />
                <Route key="list-user-role-scopes-route" path={"/"} element={<RequirePriviledge requireAllPrivileges={true} privileges={[APP_STOCKMANAGEMENT_USERROLESCOPES]} userContext={userContext}><UserRoleScopeList /></RequirePriviledge>} />
                <Route key="default-user-role-scopes-route" path={"*"} element={<Navigate to={URL_USER_ROLE_SCOPES} />} />,
            </Routes>
        </div>
    </div>
}

export default UserRoleScopes;