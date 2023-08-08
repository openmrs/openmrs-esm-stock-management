import React, { useMemo } from 'react'
import { useAppSelector } from '../app/hooks'
import { today } from '../core/utils/datetimeUtils'
import { hasEveryPrivilegeScope, hasSomePrivilegeScope } from '../core/utils/privilegeUtil'
import { selectPrivilegeScopes, selectPrivileges } from './authSlice'

export interface AuthRequirement {
    privileges: string[] | null,
    requireAllPrivileges?: boolean | false,
    children: JSX.Element
  };
  
  export const AccessControl = ({ privileges, requireAllPrivileges, children }: AuthRequirement) => {
    const userPrivileges = useAppSelector(selectPrivileges);
    const displayChildren = useMemo(() => {
      return privileges == null ||
        privileges.length === 0 ||
        (userPrivileges &&
          (requireAllPrivileges ? hasEveryPrivilegeScope(privileges, userPrivileges) :
            hasSomePrivilegeScope(privileges, userPrivileges)));
    }, [userPrivileges, privileges, requireAllPrivileges]);
    return <>{displayChildren && children}</>
  }

  export const useHasPreviledge = (privileges: string[], requireAllPrivileges: boolean) => {
    const userPrivileges = useAppSelector(selectPrivileges);
    const displayChildren = useMemo(() => {
      return privileges == null ||  
      privileges.length === 0 ||      
        (userPrivileges &&
          (requireAllPrivileges ? hasEveryPrivilegeScope(privileges, userPrivileges) :
            hasSomePrivilegeScope(privileges, userPrivileges)));
    }, [userPrivileges, privileges, requireAllPrivileges]);

    return [displayChildren]
}

export const useGetPrivilegeScopes = (privileges: string[]) =>{
  const userPrivilegeScopes = useAppSelector(selectPrivilegeScopes);
    const privilegeScopes = useMemo(() => {
      if(privileges == null ||  privileges.length === 0 ){
        return [];
      }
      var now = today();
      return userPrivilegeScopes?.filter(p => privileges.includes(p.privilege) && (p.isPermanent || (p.activeFrom && p.activeTo && now.getTime() >= p.activeFrom.getTime() && now.getTime() <= p.activeTo.getTime() ) ) ) ?? [];
    }, [privileges, userPrivilegeScopes]);
    return privilegeScopes;
    
}
  