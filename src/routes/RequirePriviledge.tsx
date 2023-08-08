import React, { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { URL_ACCESS_DENIED } from "../config";
import { UserContextState } from "../core/api/types/identity/UserContextState";
import {
  hasEveryPrivilegeScope,
  hasSomePrivilegeScope,
} from "../core/utils/privilegeUtil";

export interface PrivateRouteProps {
  privileges: string[] | null;
  userContext: UserContextState;
  requireAllPrivileges: boolean | false;
  children: JSX.Element;
}

export const RequirePriviledge = ({
  privileges,
  userContext,
  requireAllPrivileges,
  children,
}: PrivateRouteProps) => {
  const continueToRoute = useMemo(() => {
    return (
      privileges == null ||
      privileges.length === 0 ||
      (userContext?.user?.privileges &&
        (requireAllPrivileges
          ? hasEveryPrivilegeScope(privileges, userContext?.user?.privileges)
          : hasSomePrivilegeScope(privileges, userContext?.user?.privileges)))
    );
  }, [privileges, userContext, requireAllPrivileges]);
  return (
    <>
      {continueToRoute ? (
        children
      ) : (
        <Navigate
          to={{
            pathname: URL_ACCESS_DENIED,
          }}
        />
      )}
    </>
  );
};

export default RequirePriviledge;
