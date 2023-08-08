import { OpenmrsObject } from "./OpenmrsObject";
import { User } from "./identity/User";

export interface Auditable extends OpenmrsObject {
  creator: User;
  dateCreated: Date;
  changedBy: User;
  dateChanged: Date;
}
