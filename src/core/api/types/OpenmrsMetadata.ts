import { OpenmrsObject } from "./OpenmrsObject";
import { Auditable } from "./Auditable";
import { Retireable } from "./Retireable";

export interface OpenmrsMetadata extends OpenmrsObject, Auditable, Retireable {
  name: string;
  description: string;
}
