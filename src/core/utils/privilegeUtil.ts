import { SessionPriviledge as SessionPrivilege } from '../api/types/identity/User';

export const hasSomePrivilegeScope = (requiredPrivileges: string[], userPrivileges: SessionPrivilege[]) => {
    if (requiredPrivileges && requiredPrivileges.length > 0 && userPrivileges && userPrivileges.length > 0) {
        return userPrivileges.some(p => requiredPrivileges.includes(p.name));
    }
    return false;
}

export const hasEveryPrivilegeScope = (requiredPrivileges: string[], userPrivileges: SessionPrivilege[]) => {
    if (requiredPrivileges && requiredPrivileges.length > 0 && userPrivileges && userPrivileges.length > 0) {
        var matchedUserPrivilegeScopes = userPrivileges.filter(p => requiredPrivileges.includes(p.name)).map(p => p.name);
        return requiredPrivileges.every(p => matchedUserPrivilegeScopes.includes(p));
    }
    return false;
}