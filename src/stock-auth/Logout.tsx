import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Splash } from "../components/spinner/Splash";
import { useLogoutMutation } from "../core/api/session";

export const Logout = () => {
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  useEffect(() => {
    logout(null);
  }, [logout, navigate]);

  return <Splash active={true}></Splash>;
};
