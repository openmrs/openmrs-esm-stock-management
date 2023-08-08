import { User } from './identity/User';
import { OpenmrsObject } from './OpenmrsObject'

export interface Retireable extends OpenmrsObject {
    retired: boolean;
    dateRetired: Date;
    retiredBy: User;
    retireReason: string;
}

