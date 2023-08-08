import React, { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectStatus } from "../../stock-auth/authSlice";
import { Splash } from "../spinner/Splash";

type DefaultLayoutProps = {
  children: React.ReactNode;
};

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const loadingStatus = useAppSelector(selectStatus);
  const [active, setActive] = useState(true);
  // useEffect(() => {
  //   setActive(loadingStatus === LoadingStatus.LOADING);
  // }, [loadingStatus]);
  return (
    <>
      <Splash active={active} />
      {children}
    </>
  );
};
