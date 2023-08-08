import React, { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import AccessDenied from "../components/accessDenied/AccessDenied";
import NotFound from "../components/notFound/NotFound";
import {
  URL_ACCESS_DENIED,
  URL_LOCATIONS_ROUTES,
  URL_NOT_FOUND,
  URL_SIGN_IN,
  URL_SIGN_OUT,
  URL_STOCK_HOME,
  URL_STOCK_ITEMS_ROUTES,
  URL_STOCK_OPERATIONS_ROUTES,
  URL_STOCK_REPORTS_ROUTES,
  URL_STOCK_SOURCES_ROUTES,
  URL_USER_ROLE_SCOPES_ROUTES,
  URL_WILDCARD,
} from "../constants";
import { UserContextState } from "../core/api/types/identity/UserContextState";
import { MANAGE_LOCATIONS } from "../core/openmrsPriviledges";
import * as priv from "../core/privileges";
import { Logout } from "../stock-auth/Logout";
import StockDashboard from "../stock-dashboard/stock-dashboard.component";
import RequirePriviledge from "./RequirePriviledge";

const StockOperations = lazy(
  () => import("../stock-operations/stock-operations.component")
);
const UserRoleScopes = lazy(
  () => import("../stock-roles/user-role-scopes.component")
);
const StockItems = lazy(() => import("../stock-items/stock-items.component"));
const StockSources = lazy(
  () => import("../stock-sources/stock-sources.component")
);
const Locations = lazy(
  () => import("../stock-locations/stock-locations.component")
);
const Reports = lazy(() => import("../stock-reports/stock-reports.component"));

export const protectedRoutes = (userContext: UserContextState) => [
  <Route
    key="home"
    path={URL_STOCK_HOME}
    element={
      <RequirePriviledge
        requireAllPrivileges={false}
        privileges={[]}
        userContext={userContext}
      >
        <StockDashboard />
      </RequirePriviledge>
    }
  />,
  <Route
    key="stock-operations-route"
    path={URL_STOCK_OPERATIONS_ROUTES}
    element={
      <RequirePriviledge
        requireAllPrivileges={false}
        privileges={[priv.APP_STOCKMANAGEMENT_STOCKOPERATIONS]}
        userContext={userContext}
      >
        <StockOperations userContext={userContext} />
      </RequirePriviledge>
    }
  />,
  <Route
    key="user-role-scopes-route"
    path={URL_USER_ROLE_SCOPES_ROUTES}
    element={
      <RequirePriviledge
        requireAllPrivileges={false}
        privileges={[priv.APP_STOCKMANAGEMENT_USERROLESCOPES]}
        userContext={userContext}
      >
        <UserRoleScopes userContext={userContext} />
      </RequirePriviledge>
    }
  />,
  <Route
    key="stock-items-route"
    path={URL_STOCK_ITEMS_ROUTES}
    element={
      <RequirePriviledge
        requireAllPrivileges={false}
        privileges={[priv.APP_STOCKMANAGEMENT_STOCKITEMS]}
        userContext={userContext}
      >
        <StockItems userContext={userContext} />
      </RequirePriviledge>
    }
  />,
  <Route
    key="stock-sources-route"
    path={URL_STOCK_SOURCES_ROUTES}
    element={
      <RequirePriviledge
        requireAllPrivileges={false}
        privileges={[priv.APP_STOCKMANAGEMENT_STOCKSOURCES]}
        userContext={userContext}
      >
        <StockSources userContext={userContext} />
      </RequirePriviledge>
    }
  />,
  <Route
    key="stock-locations-route"
    path={URL_LOCATIONS_ROUTES}
    element={
      <RequirePriviledge
        requireAllPrivileges={false}
        privileges={[MANAGE_LOCATIONS]}
        userContext={userContext}
      >
        <Locations userContext={userContext} />
      </RequirePriviledge>
    }
  />,
  <Route
    key="stock-reports-route"
    path={URL_STOCK_REPORTS_ROUTES}
    element={
      <RequirePriviledge
        requireAllPrivileges={false}
        privileges={[priv.APP_STOCKMANAGEMENT_REPORTS]}
        userContext={userContext}
      >
        <Reports userContext={userContext} />
      </RequirePriviledge>
    }
  />,

  <Route
    key="sign-in-route"
    path={URL_SIGN_IN}
    element={<Navigate to={URL_STOCK_HOME} />}
  />,
  <Route key="sign-out-route" path={URL_SIGN_OUT} element={<Logout />} />,
  <Route
    key="access-denied-route"
    path={URL_ACCESS_DENIED}
    element={<AccessDenied />}
  />,
  <Route
    key="not-found-route"
    path={URL_NOT_FOUND}
    element={<Navigate to={URL_STOCK_HOME} />}
  />,
  <Route
    key="wild-match-route"
    path={URL_WILDCARD}
    element={<NotFound />}
  ></Route>,
];
