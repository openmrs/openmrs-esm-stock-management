import React from "react";
import { Navigate, Route } from "react-router-dom";
import { URL_SIGN_IN, URL_WILDCARD } from "../constants";
import { Login } from "../stock-auth/Login";

export const publicRoutes = [
  <Route key="sign-in-route" path={URL_SIGN_IN} element={<Login />} />,
  <Route
    key="default-sign-route"
    path={URL_WILDCARD}
    element={<Navigate to={URL_SIGN_IN} />}
  />,
];
