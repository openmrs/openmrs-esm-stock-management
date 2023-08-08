import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { URL_LOCATIONS } from "../constants";
import { UserContextState } from "../core/api/types/identity/UserContextState";
import { MANAGE_LOCATIONS } from '../core/openmrsPriviledges';
import RequirePriviledge from "../routes/RequirePriviledge";
import LocationList from './stock-location-list.component';

export interface LocationsProps {
    userContext: UserContextState
}

export const Locations: React.FC<LocationsProps> = ({
    userContext
}) => {
    return <div className="row">
        <div className="col-12">
            <Routes>
                <Route key="list-locations-route" path={"/"} element={<RequirePriviledge requireAllPrivileges={true} privileges={[MANAGE_LOCATIONS]} userContext={userContext}><LocationList /></RequirePriviledge>} />
                <Route key="default-locations-route" path={"*"} element={<Navigate to={URL_LOCATIONS} />} />,
            </Routes>
        </div>
    </div>
}

export default Locations;
