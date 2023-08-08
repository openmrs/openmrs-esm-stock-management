import { User } from "./User";
import LoadingStatus from "../../../loadingStatus";
import { PrivilegeScope } from "./PriviledgeScope";

export interface UserContextState {
  user: null | User;
  isAuthenticated: boolean;
  authenticationMessage: string | null;
  status: LoadingStatus;
  privilegeScopes: PrivilegeScope[] | null;
}
