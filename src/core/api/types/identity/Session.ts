import { SessionLocation } from '@openmrs/esm-framework';
import { PrivilegeScope } from './PriviledgeScope';
import { User } from './User';

export interface GetSessionResponse {
  sessionId: string;
  authenticated: boolean;
  user: User;
  locale: string;
  allowedLocales: string[];
  sessionLocation?: SessionLocation;
}

export interface StockManagementSession {
  privileges: PrivilegeScope[];
}
