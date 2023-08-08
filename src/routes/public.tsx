import React from "react";
import { Login } from "../features/auth/Login";
import { Navigate, Route } from "react-router-dom";
import { URL_SIGN_IN, URL_WILDCARD } from "../config";

export const publicRoutes = [
  <Route key="sign-in-route" path={URL_SIGN_IN} element={<Login />} />,
  <Route
    key="default-sign-route"
    path={URL_WILDCARD}
    element={<Navigate to={URL_SIGN_IN} />}
  />,
];
