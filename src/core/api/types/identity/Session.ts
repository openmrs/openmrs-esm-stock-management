import { PrivilegeScope } from "./PriviledgeScope";
import { User } from "./User";

export interface GetSessionResponse {
  sessionId: string;
  authenticated: boolean;
  user: User;
  locale: string;
  allowedLocales: string[];
  sessionLocation?: any;
}

export interface StockManagementSession {
  privileges: PrivilegeScope[];
}
