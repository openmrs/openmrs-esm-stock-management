import { BaseOpenmrsData } from '../BaseOpenmrsData'
import { UserRoleScopeLocation } from './UserRoleScopeLocation'
import { UserRoleScopeOperationType } from './UserRoleScopeOperationType'

export interface UserRoleScope extends BaseOpenmrsData {

    userUuid?: string;
    role?: string;
    userName?: string;
    userGivenName?: string;
    userFamilyName?: string;
    permanent: boolean;
    activeFrom?: Date;
    activeTo?: Date;
    enabled: boolean;
    locations: UserRoleScopeLocation[];
    operationTypes: UserRoleScopeOperationType[];
}

